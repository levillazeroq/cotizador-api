import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PriceListsService } from '../../price-lists/price-lists.service';
import { ProductsService } from '../../products/products.service';
import { Cart } from '../../database/schemas';

export interface PriceListEvaluationContext {
  totalPrice: number;
  totalQuantity: number;
  cart: Cart;
}

export interface ProductPriceResult {
  productId: number;
  priceListId: number;
  priceListName: string;
  amount: string;
  appliedConditions?: string[];
}

export interface CartItemWithPrice {
  productId: number;
  name: string;
  sku: string;
  price: string;
  quantity: number;
  description?: string | null;
  imageUrl?: string | null;
}

@Injectable()
export class PriceListEvaluationService {
  private readonly logger = new Logger(PriceListEvaluationService.name);

  constructor(
    private readonly priceListsService: PriceListsService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Procesa items del carrito y calcula sus precios con la lista de precios aplicable
   * @returns Array de items con precios y información de la lista de precios aplicada
   */
  async processCartItemsWithPricing(
    items: Array<{ productId: number; quantity: number }>,
    cart: Cart,
    organizationId: string,
  ): Promise<{
    processedItems: CartItemWithPrice[];
    appliedPriceList: any;
  }> {
    // Obtener la lista de precios por defecto
    const priceLists = await this.priceListsService.getPriceLists(
      organizationId,
      { status: 'active' },
    );

    const defaultPriceList = priceLists.priceLists.find(
      (priceList) => priceList.isDefault,
    );

    if (!defaultPriceList) {
      throw new NotFoundException('Default price list not found');
    }

    // Paso 1: Obtener productos con precios de lista por defecto
    const itemsWithDefaultPrices: CartItemWithPrice[] = [];
    const itemsIds = items.map((item) => item.productId);

    // const products = await this.productsService.getProductsByIds(itemsIds, organizationId);

    // console.log("products", products);

    for (const item of items) {
      const product = await this.productsService.getProductById(
        item.productId,
        organizationId,
      );

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Buscar el precio del producto en la lista por defecto
      const defaultPrice = product.prices.find(
        (price) => price.price_list_id === defaultPriceList.id,
      );

      if (!defaultPrice) {
        throw new NotFoundException(
          `Price not found for product ${item.productId} in default price list`,
        );
      }

      itemsWithDefaultPrices.push({
        productId: item.productId,
        name: product.name,
        sku: product.sku,
        price: defaultPrice.amount,
        quantity: item.quantity,
        description: product.description || null,
        imageUrl: product.media?.[0]?.url || null,
      });
    }

    // Paso 2: Calcular totales con precios por defecto para evaluación
    const totalQuantity = itemsWithDefaultPrices.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const totalPrice = itemsWithDefaultPrices.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    // Paso 3: Encontrar la lista de precios aplicable según condiciones
    const applicablePriceList = await this.findApplicablePriceList(
      {
        totalPrice,
        totalQuantity,
        cart,
      },
      organizationId,
    );

    this.logger.log(
      `Price list "${applicablePriceList.name}" (ID: ${applicablePriceList.id}) applies. ${
        applicablePriceList.id === defaultPriceList.id
          ? '(default)'
          : '(conditions met)'
      }`,
    );

    // Paso 4: Actualizar precios si la lista aplicable es diferente a la por defecto
    if (applicablePriceList.id !== defaultPriceList.id) {
      for (const item of itemsWithDefaultPrices) {
        const { amount } = await this.getProductPrice(
          item.productId,
          applicablePriceList.id,
          organizationId,
        );
        item.price = amount;
      }

      this.logger.log(
        `Prices updated with price list "${applicablePriceList.name}"`,
      );
    }

    return {
      processedItems: itemsWithDefaultPrices,
      appliedPriceList: applicablePriceList,
    };
  }

  /**
   * Encuentra la lista de precios aplicable según las condiciones
   */
  async findApplicablePriceList(
    context: PriceListEvaluationContext,
    organizationId: string,
  ): Promise<any> {
    const priceLists = await this.priceListsService.getPriceLists(
      organizationId,
      { status: 'active' },
    );

    const defaultPriceList = priceLists.priceLists.find(
      (priceList) => priceList.isDefault,
    );

    if (!defaultPriceList) {
      throw new NotFoundException('Default price list not found');
    }

    // Ordenar las listas de precios por la prioridad más alta de sus condiciones
    const sortedPriceLists = [...priceLists.priceLists]
      .filter((pl) => !pl.isDefault && pl.status === 'active')
      .sort((a, b) => {
        const maxPriorityA = Math.max(
          ...a.conditions.map((c) => c.priority),
          0,
        );
        const maxPriorityB = Math.max(
          ...b.conditions.map((c) => c.priority),
          0,
        );
        return maxPriorityB - maxPriorityA; // Mayor prioridad primero
      });

    // Evaluar cada lista de precios
    for (const priceList of sortedPriceLists) {
      if (!priceList.conditions || priceList.conditions.length === 0) {
        continue;
      }

      const activeConditions = priceList.conditions.filter(
        (c) => c.status === 'active',
      );

      if (activeConditions.length === 0) {
        continue;
      }

      const allConditionsMet = activeConditions.every((condition) =>
        this.evaluateCondition(
          condition,
          context.totalPrice,
          context.totalQuantity,
          context.cart,
        ),
      );

      if (allConditionsMet) {
        this.logger.log(
          `Price list "${priceList.name}" (ID: ${priceList.id}) applies to cart ${context.cart.id}`,
        );
        return priceList;
      }
    }

    // Si ninguna lista cumple, retornar la lista por defecto
    return defaultPriceList;
  }

  /**
   * Obtiene el precio de un producto según la lista de precios aplicable
   */
  async getProductPrice(
    productId: number,
    priceListId: number,
    organizationId: string,
  ): Promise<{ amount: string; priceListId: number }> {
    const product = await this.productsService.getProductById(
      productId,
      organizationId,
    );

    const productPrice = product.prices.find(
      (price) => price.price_list_id === priceListId,
    );

    if (!productPrice) {
      throw new NotFoundException(
        `Price not found for product ${productId} in price list ${priceListId}`,
      );
    }

    return {
      amount: productPrice.amount,
      priceListId: priceListId,
    };
  }

  /**
   * Obtiene el precio de un producto con su lista de precios aplicable
   */
  async getProductPriceWithApplicableList(
    productId: number,
    context: PriceListEvaluationContext,
    organizationId: string,
  ): Promise<{ amount: string; priceListId: number; priceListName: string }> {
    const applicablePriceList = await this.findApplicablePriceList(
      context,
      organizationId,
    );

    const { amount } = await this.getProductPrice(
      productId,
      applicablePriceList.id,
      organizationId,
    );

    return {
      amount,
      priceListId: applicablePriceList.id,
      priceListName: applicablePriceList.name,
    };
  }

  /**
   * Evalúa si una condición de lista de precios se cumple
   */
  private evaluateCondition(
    condition: any,
    totalPrice: number,
    totalQuantity: number,
    cart: Cart,
  ): boolean {
    const now = new Date();

    // Verificar validez temporal de la condición
    if (condition.validFrom) {
      const validFrom = new Date(condition.validFrom);
      if (now < validFrom) {
        return false;
      }
    }

    if (condition.validTo) {
      const validTo = new Date(condition.validTo);
      if (now > validTo) {
        return false;
      }
    }

    // Evaluar según el tipo de condición
    switch (condition.conditionType) {
      case 'amount':
        return this.evaluateAmountCondition(condition, totalPrice);

      case 'quantity':
        return this.evaluateQuantityCondition(condition, totalQuantity);

      case 'date_range':
        return this.evaluateDateRangeCondition(condition);

      case 'customer_type':
        return this.evaluateCustomerTypeCondition(condition, cart);

      default:
        this.logger.warn(
          `Unknown condition type: ${condition.conditionType}`,
        );
        return false;
    }
  }

  /**
   * Evalúa condición de monto
   */
  private evaluateAmountCondition(
    condition: any,
    totalPrice: number,
  ): boolean {
    const minAmount = condition.conditionValue?.min_amount || 0;
    const maxAmount = condition.conditionValue?.max_amount;

    switch (condition.operator) {
      case 'greater_than':
        return totalPrice > minAmount;

      case 'greater_or_equal':
        return totalPrice >= minAmount;

      case 'less_than':
        return totalPrice < minAmount;

      case 'less_or_equal':
        return totalPrice <= minAmount;

      case 'equals':
        return totalPrice === minAmount;

      case 'between':
        return (
          totalPrice >= minAmount && totalPrice <= (maxAmount || Infinity)
        );

      default:
        this.logger.warn(
          `Unknown operator for amount condition: ${condition.operator}`,
        );
        return false;
    }
  }

  /**
   * Evalúa condición de cantidad
   */
  private evaluateQuantityCondition(
    condition: any,
    totalQuantity: number,
  ): boolean {
    const minQuantity = condition.conditionValue?.min_quantity || 0;
    const maxQuantity = condition.conditionValue?.max_quantity;

    switch (condition.operator) {
      case 'greater_than':
        return totalQuantity > minQuantity;

      case 'greater_or_equal':
        return totalQuantity >= minQuantity;

      case 'less_than':
        return totalQuantity < minQuantity;

      case 'less_or_equal':
        return totalQuantity <= minQuantity;

      case 'equals':
        return totalQuantity === minQuantity;

      case 'between':
        return (
          totalQuantity >= minQuantity &&
          totalQuantity <= (maxQuantity || Infinity)
        );

      default:
        this.logger.warn(
          `Unknown operator for quantity condition: ${condition.operator}`,
        );
        return false;
    }
  }

  /**
   * Evalúa condición de rango de fechas
   */
  private evaluateDateRangeCondition(condition: any): boolean {
    const now = new Date();
    const fromDate = condition.conditionValue?.from_date
      ? new Date(condition.conditionValue.from_date)
      : null;
    const toDate = condition.conditionValue?.to_date
      ? new Date(condition.conditionValue.to_date)
      : null;

    switch (condition.operator) {
      case 'between':
        if (!fromDate || !toDate) {
          return false;
        }
        return now >= fromDate && now <= toDate;

      case 'after':
        if (!fromDate) {
          return false;
        }
        return now > fromDate;

      case 'before':
        if (!toDate) {
          return false;
        }
        return now < toDate;

      default:
        this.logger.warn(
          `Unknown operator for date_range condition: ${condition.operator}`,
        );
        return false;
    }
  }

  /**
   * Evalúa condición de tipo de cliente
   * TODO: Implementar lógica basada en información del cliente
   */
  private evaluateCustomerTypeCondition(condition: any, cart: Cart): boolean {
    const requiredCustomerType = condition.conditionValue?.customer_type;

    if (!requiredCustomerType) {
      return false;
    }

    // TODO: Agregar campo customer_type al schema de Cart
    // Por ahora, se puede inferir del documentType o agregar un campo específico
    // Ejemplo: si documentType es 'RUT', puede ser B2B; si es 'RUN', puede ser B2C

    // Placeholder: siempre retorna false hasta que se implemente la lógica de customer_type
    this.logger.warn(
      'Customer type condition not fully implemented. Add customer_type field to Cart schema.',
    );
    return false;
  }
}

