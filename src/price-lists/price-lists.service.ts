import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import {
  PriceListRepository,
  type PriceListWithConditions,
} from './repositories/price-list.repository';
import { PriceListConditionRepository } from './repositories/price-list-condition.repository';
import { TaxClassRepository } from './repositories/tax-class.repository';
import { ProductPriceRepository } from './repositories/product-price.repository';
import { ProductsService } from '../products/products.service';
import { type NewPriceList } from '../database/schemas';

export interface PriceListsResponse {
  priceLists: PriceListWithConditions[];
}

export interface ProductWithPrice {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  imageUrl: string | null;
  price: {
    id: number;
    amount: string;
    currency: string;
    taxIncluded: boolean;
    validFrom: Date | null;
    validTo: Date | null;
  } | null;
}

export interface PriceListProductsResponse {
  products: ProductWithPrice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PriceListsService {
  constructor(
    private readonly priceListRepository: PriceListRepository,
    // private readonly priceListConditionRepository: PriceListConditionRepository,
    // private readonly taxClassRepository: TaxClassRepository,
    private readonly productPriceRepository: ProductPriceRepository,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async getPriceLists(
    organizationId: string,
    options?: { status?: string },
    ids?: number[],
  ): Promise<PriceListsResponse> {
    const orgId = parseInt(organizationId, 10);
    
    const priceLists = await this.priceListRepository.findAllWithConditions(
      orgId,
      options,
    );

    // Transformar al formato esperado (agregar campos calculados si es necesario)
    const transformedPriceLists = priceLists.map((priceList) => ({
      ...priceList,
      isActive: priceList.status === 'active',
      hasTaxMode: !!priceList.pricingTaxMode,
    }));

    return {
      priceLists: transformedPriceLists,
    };
  }

  async getPriceListById(
    id: string,
    organizationId: string,
  ): Promise<PriceListWithConditions> {
    const orgId = parseInt(organizationId, 10);
    const priceListId = parseInt(id, 10);

    const priceList = await this.priceListRepository.findByIdWithConditions(
      priceListId,
      orgId,
    );

    if (!priceList) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    return {
      ...priceList,
      isActive: priceList.status === 'active',
      hasTaxMode: !!priceList.pricingTaxMode,
    } as any;
  }

  async createPriceList(
    data: any,
    organizationId: string,
  ): Promise<PriceListWithConditions> {
    const orgId = parseInt(organizationId, 10);

    const newPriceList: NewPriceList = {
      organizationId: orgId,
      name: data.name,
      currency: data.currency || 'CLP',
      isDefault: data.isDefault || false,
      status: data.status || 'active',
      pricingTaxMode: data.pricingTaxMode || 'tax_included',
    };

    const created = await this.priceListRepository.create(newPriceList);

    // Retornar con condiciones (vacías inicialmente)
    return {
      ...created,
      conditions: [],
      isActive: created.status === 'active',
      hasTaxMode: !!created.pricingTaxMode,
    } as any;
  }

  async updatePriceList(
    id: string,
    data: any,
    organizationId: string,
  ): Promise<PriceListWithConditions> {
    const orgId = parseInt(organizationId, 10);
    const priceListId = parseInt(id, 10);

    // Verificar que existe
    const existing = await this.priceListRepository.findById(
      priceListId,
      orgId,
    );
    if (!existing) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    // Validar que siempre haya una lista por defecto
    if (data.isDefault === false && existing.isDefault) {
      // Verificar si hay otra lista por defecto
      const allPriceLists = await this.priceListRepository.findAll(orgId);
      
      // Contar cuántas listas por defecto hay
      const defaultCount = allPriceLists.filter(pl => pl.isDefault).length;
      
      // Si solo hay una por defecto y es la actual, no se puede cambiar
      if (defaultCount === 1) {
        throw new BadRequestException(
          'No se puede quitar el estado por defecto. Debe existir al menos una lista de precios por defecto. Por favor, establece otra lista como predeterminada primero.',
        );
      }
    }

    // Si se está estableciendo como por defecto, quitar el default de las demás
    if (data.isDefault === true && !existing.isDefault) {
      // Buscar la lista por defecto actual y quitarle el flag
      const currentDefault = await this.priceListRepository.findDefault(orgId);
      if (currentDefault && currentDefault.id !== priceListId) {
        await this.priceListRepository.update(currentDefault.id, orgId, {
          isDefault: false,
        });
      }
    }

    const updateData: Partial<NewPriceList> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.pricingTaxMode !== undefined)
      updateData.pricingTaxMode = data.pricingTaxMode;

    const updated = await this.priceListRepository.update(
      priceListId,
      orgId,
      updateData,
    );

    // Retornar con condiciones actualizadas
    return this.getPriceListById(id, organizationId);
  }

  async deletePriceList(id: string, organizationId: string): Promise<void> {
    const orgId = parseInt(organizationId, 10);
    const priceListId = parseInt(id, 10);

    // Verificar que existe
    const existing = await this.priceListRepository.findById(
      priceListId,
      orgId,
    );
    if (!existing) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    // Verificar que no es la lista por defecto
    if (existing.isDefault) {
      throw new BadRequestException(
        'No se puede eliminar la lista de precios por defecto. Por favor, establece otra lista como predeterminada primero.',
      );
    }

    const deleted = await this.priceListRepository.delete(priceListId, orgId);

    if (!deleted) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }
  }

  /**
   * Obtiene productos con sus precios para una lista de precios específica (paginado)
   */
  async getPriceListProducts(
    id: string,
    organizationId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<PriceListProductsResponse> {
    const orgId = parseInt(organizationId, 10);
    const priceListId = parseInt(id, 10);

    // Validar parámetros de paginación
    const pageNumber = Math.max(1, page);
    const pageSize = Math.min(Math.max(1, limit), 100); // Máximo 100 por página

    // Verificar que la lista de precios existe
    const priceList = await this.priceListRepository.findById(
      priceListId,
      orgId,
    );
    if (!priceList) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    // Obtener precios de productos paginados para esta lista
    const {
      data: productPrices,
      total,
      totalPages,
    } = await this.productPriceRepository.findByPriceListIdPaginated(
      priceListId,
      orgId,
      pageNumber,
      pageSize,
      search,
    );

    if (productPrices.length === 0) {
      return {
        products: [],
        total: 0,
        page: pageNumber,
        limit: pageSize,
        totalPages: 0,
      };
    }

    // Obtener los IDs de productos únicos
    const productIds = [
      ...new Set(productPrices.map((pp) => pp.productId)),
    ];

    // Obtener los productos del servicio (con media para imágenes)
    const products = await this.productsService.getProductsByIds(
      productIds,
      organizationId,
    );

    // Crear un mapa de precios por productId para acceso rápido
    const priceMap = new Map(
      productPrices.map((pp) => [
        pp.productId,
        {
          id: pp.id,
          amount: pp.amount,
          currency: pp.currency,
          taxIncluded: pp.taxIncluded,
          validFrom: pp.validFrom,
          validTo: pp.validTo,
        },
      ]),
    );

    // Combinar productos con sus precios
    const productsWithPrices: ProductWithPrice[] = products.map((product) => {
      // Obtener imagen principal del producto
      const primaryImage = product.media?.find((m) => m.is_primary) || product.media?.[0];
      const imageUrl = primaryImage?.url || null;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        imageUrl,
        price: priceMap.get(product.id) || null,
      };
    });

    return {
      products: productsWithPrices,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    };
  }

  /**
   * Obtiene precios de productos por sus IDs
   * Retorna todos los precios activos de los productos especificados
   */
  async getProductPricesByProductIds(
    productIds: number[],
    organizationId: string,
  ): Promise<Array<{
    id: number;
    product_id: number;
    price_list_id: number;
    currency: string;
    amount: string;
    tax_included: boolean;
    valid_from: string | null;
    valid_to: string | null;
    created_at: string;
    price_list_name: string;
    price_list_is_default: boolean;
  }>> {
    const orgId = parseInt(organizationId, 10);

    if (productIds.length === 0) {
      return [];
    }

    // Obtener todos los precios activos de los productos
    const allPrices = await this.productPriceRepository.findByProductIds(
      productIds,
      orgId,
    );

    if (allPrices.length === 0) {
      return [];
    }

    // Obtener información de las listas de precios para incluir nombre y si es default
    const priceListIds = [...new Set(allPrices.map((p) => p.priceListId))];
    const priceLists = await Promise.all(
      priceListIds.map((id) =>
        this.priceListRepository.findById(id, orgId),
      ),
    );

    const priceListMap = new Map(
      priceLists
        .filter((pl) => pl !== null)
        .map((pl) => [pl!.id, pl!]),
    );

    // Mapear al formato ProductPrice esperado incluyendo product_id
    return allPrices.map((price) => {
      const priceList = priceListMap.get(price.priceListId);

      return {
        id: price.id,
        product_id: price.productId,
        price_list_id: price.priceListId,
        currency: price.currency,
        amount: price.amount,
        tax_included: price.taxIncluded,
        valid_from: price.validFrom?.toISOString() || null,
        valid_to: price.validTo?.toISOString() || null,
        created_at: price.createdAt.toISOString(),
        price_list_name: priceList?.name || '',
        price_list_is_default: priceList?.isDefault || false,
      };
    });
  }
}
