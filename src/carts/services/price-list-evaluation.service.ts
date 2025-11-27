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

export interface PriceListProgress {
  priceListId: number;
  priceListName: string;
  conditions: ConditionProgress[];
}

export interface ConditionProgress {
  conditionId: number;
  conditionType: string;
  isMet: boolean;
  progress: number; // Porcentaje 0-100
  currentValue: number;
  targetValue: number;
  remaining: number;
  unit: string; // 'amount', 'quantity', 'days'
  message: string;
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

    // Paso 3: Encontrar TODAS las listas de precios que cumplen condiciones
    const applicablePriceLists = await this.findAllApplicablePriceLists(
      {
        totalPrice,
        totalQuantity,
        cart,
      },
      organizationId,
    );

    this.logger.log(
      `Found ${applicablePriceLists.length} applicable price lists (including default)`,
    );

    // Paso 4: Calcular el precio total con cada lista y elegir la de menor precio
    let bestPriceList = defaultPriceList;
    let lowestTotalPrice = totalPrice;

    for (const priceList of applicablePriceLists) {
      let currentTotal = 0;

      // Calcular el total con esta lista de precios
      for (const item of items) {
        try {
          const { amount } = await this.getProductPrice(
            item.productId,
            priceList.id,
            organizationId,
          );
          currentTotal += Number(amount) * item.quantity;
        } catch (error) {
          // Si no hay precio en esta lista, skip
          this.logger.warn(
            `No price found for product ${item.productId} in price list ${priceList.id}`,
          );
          currentTotal = Infinity; // Invalida esta lista
          break;
        }
      }

      // Si esta lista ofrece mejor precio, usarla
      if (currentTotal < lowestTotalPrice) {
        lowestTotalPrice = currentTotal;
        bestPriceList = priceList;
        this.logger.log(
          `Price list "${priceList.name}" (ID: ${priceList.id}) offers better price: ${lowestTotalPrice} vs ${totalPrice}`,
        );
      }
    }

    this.logger.log(
      `Selected price list "${bestPriceList.name}" (ID: ${bestPriceList.id}) with total price: ${lowestTotalPrice}`,
    );

    // Paso 5: Actualizar precios con la mejor lista seleccionada
    if (bestPriceList.id !== defaultPriceList.id) {
      for (const item of itemsWithDefaultPrices) {
        const { amount } = await this.getProductPrice(
          item.productId,
          bestPriceList.id,
          organizationId,
        );
        item.price = amount;
      }

      const savings = totalPrice - lowestTotalPrice;
      this.logger.log(
        `Prices updated with price list "${bestPriceList.name}". Savings: ${savings} (${((savings / totalPrice) * 100).toFixed(2)}%)`,
      );
    }

    return {
      processedItems: itemsWithDefaultPrices,
      appliedPriceList: bestPriceList,
    };
  }

  /**
   * Calcula el progreso hacia las listas de precios disponibles
   * 
   * Reglas:
   * 1. La lista por defecto NUNCA se muestra (siempre está aplicada)
   * 2. Solo se muestran listas que el usuario AÚN NO ha alcanzado
   * 3. Motiva al usuario mostrando cuánto le falta para desbloquear mejores precios
   * 
   * Tipo Amazon: "Te faltan $50 para desbloquear precios mayoristas"
   */
  async calculatePriceListProgress(
    context: PriceListEvaluationContext,
    organizationId: string,
  ): Promise<PriceListProgress[]> {
    const priceLists = await this.priceListsService.getPriceLists(
      organizationId,
      { status: 'active' },
    );

    const progressList: PriceListProgress[] = [];

    this.logger.debug(
      `Evaluating ${priceLists.priceLists.length} price lists for progress calculation`,
    );

    // Evaluar cada lista de precios
    for (const priceList of priceLists.priceLists) {
      // REGLA 1: Excluir lista por defecto (siempre está aplicada, no hay que motivar)
      if (priceList.isDefault) {
        this.logger.debug(
          `Skipping default price list "${priceList.name}" (ID: ${priceList.id})`,
        );
        continue;
      }

      // REGLA 2: Solo listas con condiciones (sin condiciones no hay progreso que mostrar)
      if (!priceList.conditions || priceList.conditions.length === 0) {
        continue;
      }

      const activeConditions = priceList.conditions.filter(
        (c) => c.status === 'active',
      );

      if (activeConditions.length === 0) {
        continue;
      }

      const conditionProgresses: ConditionProgress[] = [];
      let allConditionsMet = true;

      for (const condition of activeConditions) {
        const progress = this.calculateConditionProgress(
          condition,
          context.totalPrice,
          context.totalQuantity,
          context.cart,
        );

        conditionProgresses.push(progress);

        if (!progress.isMet) {
          allConditionsMet = false;
        }
      }

      // REGLA 3: Solo incluir listas que AÚN NO están completamente cumplidas
      // (para motivar al usuario a seguir agregando productos)
      if (!allConditionsMet) {
        this.logger.debug(
          `Including price list "${priceList.name}" (ID: ${priceList.id}) - not all conditions met`,
        );
        progressList.push({
          priceListId: priceList.id,
          priceListName: priceList.name,
          conditions: conditionProgresses,
        });
      } else {
        this.logger.debug(
          `Skipping price list "${priceList.name}" (ID: ${priceList.id}) - all conditions already met`,
        );
      }
    }

    this.logger.log(
      `Found ${progressList.length} price lists with unfulfilled conditions to show progress`,
    );

    return progressList;
  }

  /**
   * Calcula el progreso de una condición específica
   */
  private calculateConditionProgress(
    condition: any,
    totalPrice: number,
    totalQuantity: number,
    cart: Cart,
  ): ConditionProgress {
    let isMet = false;
    let progress = 0;
    let currentValue = 0;
    let targetValue = 0;
    let remaining = 0;
    let unit = '';
    let message = '';

    switch (condition.conditionType) {
      case 'amount': {
        const minAmount = condition.conditionValue?.min_amount || 0;
        currentValue = totalPrice;
        targetValue = minAmount;
        remaining = Math.max(0, targetValue - currentValue);
        unit = 'amount';
        progress = Math.min(100, (currentValue / targetValue) * 100);
        isMet = this.evaluateAmountCondition(condition, totalPrice);

        if (isMet) {
          message = `¡Excelente! Ya cumples con el monto mínimo`;
        } else {
          message = `Te faltan $${remaining.toFixed(0)} para desbloquear esta lista de precios`;
        }
        break;
      }

      case 'quantity': {
        const minQuantity = condition.conditionValue?.min_quantity || 0;
        currentValue = totalQuantity;
        targetValue = minQuantity;
        remaining = Math.max(0, targetValue - currentValue);
        unit = 'quantity';
        progress = Math.min(100, (currentValue / targetValue) * 100);
        isMet = this.evaluateQuantityCondition(condition, totalQuantity);

        if (isMet) {
          message = `¡Excelente! Ya cumples con la cantidad mínima`;
        } else {
          message = `Agrega ${remaining} producto${remaining > 1 ? 's' : ''} más para desbloquear esta lista de precios`;
        }
        break;
      }

      case 'date_range': {
        const now = new Date();
        const fromDate = condition.conditionValue?.from_date
          ? new Date(condition.conditionValue.from_date)
          : null;
        const toDate = condition.conditionValue?.to_date
          ? new Date(condition.conditionValue.to_date)
          : null;

        isMet = this.evaluateDateRangeCondition(condition);
        unit = 'days';

        if (isMet) {
          message = `¡Lista de precios disponible hasta ${toDate?.toLocaleDateString('es-ES')}!`;
          progress = 100;
          currentValue = 1;
          targetValue = 1;
        } else if (fromDate && now < fromDate) {
          const daysRemaining = Math.ceil((fromDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          remaining = daysRemaining;
          message = `Esta lista de precios estará disponible en ${daysRemaining} día${daysRemaining > 1 ? 's' : ''}`;
          progress = 0;
        } else {
          message = 'Esta lista de precios ya no está disponible';
          progress = 0;
        }
        break;
      }

      case 'customer_type': {
        isMet = this.evaluateCustomerTypeCondition(condition, cart);
        unit = 'customer_type';
        progress = isMet ? 100 : 0;
        currentValue = isMet ? 1 : 0;
        targetValue = 1;

        if (isMet) {
          message = `Tienes acceso a precios para clientes ${condition.conditionValue?.customer_type}`;
        } else {
          message = `Esta lista de precios es solo para clientes ${condition.conditionValue?.customer_type}`;
        }
        break;
      }

      default:
        message = 'Condición no reconocida';
        this.logger.warn(
          `Unknown condition type: ${condition.conditionType} for condition ID ${condition.id}`,
        );
    }

    return {
      conditionId: condition.id,
      conditionType: condition.conditionType,
      isMet,
      progress,
      currentValue,
      targetValue,
      remaining,
      unit,
      message,
    };
  }

  /**
   * Encuentra TODAS las listas de precios aplicables según las condiciones
   * Retorna lista por defecto + todas las que cumplan sus condiciones
   */
  async findAllApplicablePriceLists(
    context: PriceListEvaluationContext,
    organizationId: string,
  ): Promise<any[]> {
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

    const applicableLists: any[] = [defaultPriceList]; // Siempre incluir la lista por defecto

    // Evaluar cada lista de precios (excepto la por defecto)
    for (const priceList of priceLists.priceLists) {
      if (priceList.isDefault || !priceList.conditions || priceList.conditions.length === 0) {
        continue;
      }

      const activeConditions = priceList.conditions.filter(
        (c) => c.status === 'active',
      );

      if (activeConditions.length === 0) {
        continue;
      }

      // Verificar si TODAS las condiciones activas se cumplen
      const allConditionsMet = activeConditions.every((condition) =>
        this.evaluateCondition(
          condition,
          context.totalPrice,
          context.totalQuantity,
          context.cart,
        ),
      );

      if (allConditionsMet) {
        applicableLists.push(priceList);
        this.logger.log(
          `Price list "${priceList.name}" (ID: ${priceList.id}) meets all conditions`,
        );
      }
    }

    return applicableLists;
  }

  /**
   * Encuentra la lista de precios aplicable según las condiciones
   * @deprecated Use findAllApplicablePriceLists for better price selection
   * This method now returns the first applicable price list found
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

    // Evaluar cada lista de precios (sin prioridad, simplemente en orden)
    const sortedPriceLists = [...priceLists.priceLists].filter(
      (pl) => !pl.isDefault && pl.status === 'active',
    );

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

