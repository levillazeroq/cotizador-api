import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { productPrices, products } from '../../database/schemas';
import { eq, and, or, isNull, gte, lte, sql, ilike } from 'drizzle-orm';

export interface ProductPriceWithProduct {
  id: number;
  productId: number;
  priceListId: number;
  currency: string;
  amount: string;
  taxIncluded: boolean;
  validFrom: Date | null;
  validTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductPriceRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Obtiene todos los precios de productos para una lista de precios específica
   * Considera las fechas de vigencia (valid_from y valid_to)
   */
  async findByPriceListId(
    priceListId: number,
    organizationId: number,
  ): Promise<ProductPriceWithProduct[]> {
    const now = new Date();

    return await this.databaseService.db
      .select()
      .from(productPrices)
      .where(
        and(
          eq(productPrices.priceListId, priceListId),
          eq(productPrices.organizationId, organizationId),
          // Precios activos: sin fechas o dentro del rango válido
          or(
            and(
              isNull(productPrices.validFrom),
              isNull(productPrices.validTo),
            ),
            and(
              isNull(productPrices.validFrom),
              or(isNull(productPrices.validTo), gte(productPrices.validTo, now)),
            ),
            and(
              or(isNull(productPrices.validFrom), lte(productPrices.validFrom, now)),
              isNull(productPrices.validTo),
            ),
            and(
              lte(productPrices.validFrom, now),
              gte(productPrices.validTo, now),
            ),
          ),
        ),
      )
      .orderBy(productPrices.productId);
  }

  /**
   * Obtiene precios de productos paginados para una lista de precios específica
   * Considera las fechas de vigencia (valid_from y valid_to)
   * Soporta búsqueda por SKU y nombre de producto
   */
  async findByPriceListIdPaginated(
    priceListId: number,
    organizationId: number,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<{
    data: ProductPriceWithProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const now = new Date();
    const offset = (page - 1) * limit;

    // Condiciones base para productPrices
    const priceListConditions = and(
      eq(productPrices.priceListId, priceListId),
      eq(productPrices.organizationId, organizationId),
      // Precios activos: sin fechas o dentro del rango válido
      or(
        and(
          isNull(productPrices.validFrom),
          isNull(productPrices.validTo),
        ),
        and(
          isNull(productPrices.validFrom),
          or(isNull(productPrices.validTo), gte(productPrices.validTo, now)),
        ),
        and(
          or(isNull(productPrices.validFrom), lte(productPrices.validFrom, now)),
          isNull(productPrices.validTo),
        ),
        and(
          lte(productPrices.validFrom, now),
          gte(productPrices.validTo, now),
        ),
      ),
    );

    // Condiciones para productos (organización y búsqueda)
    const productConditions = [
      eq(products.organizationId, organizationId),
    ];

    // Agregar condición de búsqueda si existe
    if (search) {
      productConditions.push(
        or(
          ilike(products.sku, `%${search}%`),
          ilike(products.name, `%${search}%`),
        ),
      );
    }

    const whereCondition = and(
      priceListConditions,
      and(...productConditions),
    );

    // Obtener total de registros con JOIN
    const totalResult = await this.databaseService.db
      .select({ count: sql<number>`count(*)` })
      .from(productPrices)
      .innerJoin(
        products,
        and(
          eq(productPrices.productId, products.id),
          eq(products.organizationId, organizationId),
        ),
      )
      .where(whereCondition);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Obtener datos paginados con JOIN
    const data = await this.databaseService.db
      .select({
        id: productPrices.id,
        productId: productPrices.productId,
        priceListId: productPrices.priceListId,
        currency: productPrices.currency,
        amount: productPrices.amount,
        taxIncluded: productPrices.taxIncluded,
        validFrom: productPrices.validFrom,
        validTo: productPrices.validTo,
        createdAt: productPrices.createdAt,
        updatedAt: productPrices.updatedAt,
      })
      .from(productPrices)
      .innerJoin(
        products,
        and(
          eq(productPrices.productId, products.id),
          eq(products.organizationId, organizationId),
        ),
      )
      .where(whereCondition)
      .orderBy(products.name, productPrices.productId)
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Obtiene el precio de un producto específico en una lista de precios
   */
  async findByProductAndPriceList(
    productId: number,
    priceListId: number,
    organizationId: number,
  ): Promise<ProductPriceWithProduct | null> {
    const now = new Date();

    const results = await this.databaseService.db
      .select()
      .from(productPrices)
      .where(
        and(
          eq(productPrices.productId, productId),
          eq(productPrices.priceListId, priceListId),
          eq(productPrices.organizationId, organizationId),
          // Precio activo
          or(
            and(
              isNull(productPrices.validFrom),
              isNull(productPrices.validTo),
            ),
            and(
              isNull(productPrices.validFrom),
              or(isNull(productPrices.validTo), gte(productPrices.validTo, now)),
            ),
            and(
              or(isNull(productPrices.validFrom), lte(productPrices.validFrom, now)),
              isNull(productPrices.validTo),
            ),
            and(
              lte(productPrices.validFrom, now),
              gte(productPrices.validTo, now),
            ),
          ),
        ),
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Cuenta cuántos productos tienen precio en esta lista
   */
  async countByPriceListId(
    priceListId: number,
    organizationId: number,
  ): Promise<number> {
    const now = new Date();

    const result = await this.databaseService.db
      .select({ count: sql<number>`count(*)` })
      .from(productPrices)
      .where(
        and(
          eq(productPrices.priceListId, priceListId),
          eq(productPrices.organizationId, organizationId),
          // Solo precios activos
          or(
            and(
              isNull(productPrices.validFrom),
              isNull(productPrices.validTo),
            ),
            and(
              isNull(productPrices.validFrom),
              or(isNull(productPrices.validTo), gte(productPrices.validTo, now)),
            ),
            and(
              or(isNull(productPrices.validFrom), lte(productPrices.validFrom, now)),
              isNull(productPrices.validTo),
            ),
            and(
              lte(productPrices.validFrom, now),
              gte(productPrices.validTo, now),
            ),
          ),
        ),
      );

    return Number(result[0]?.count || 0);
  }
}

