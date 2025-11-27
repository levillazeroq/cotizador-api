import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { products, type Product, type NewProduct } from '../../database/schemas';
import { eq, and, inArray, desc, asc, sql, or, like, ilike } from 'drizzle-orm';

export interface ProductFilters {
  ids?: number[];
  status?: string;
  productType?: string;
  search?: string;
  brand?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ProductRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Encuentra un producto por ID
   */
  async findById(
    id: number,
    organizationId: number,
  ): Promise<Product | null> {
    const result = await this.databaseService.db
      .select()
      .from(products)
      .where(
        and(eq(products.id, id), eq(products.organizationId, organizationId)),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Encuentra productos por IDs
   */
  async findByIds(
    ids: number[],
    organizationId: number,
  ): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }

    return await this.databaseService.db
      .select()
      .from(products)
      .where(
        and(
          inArray(products.id, ids),
          eq(products.organizationId, organizationId),
        ),
      )
      .orderBy(desc(products.createdAt));
  }

  /**
   * Encuentra productos con filtros
   */
  async findMany(
    organizationId: number,
    filters?: ProductFilters,
  ): Promise<Product[]> {
    const conditions = [eq(products.organizationId, organizationId)];

    if (filters?.ids && filters.ids.length > 0) {
      conditions.push(inArray(products.id, filters.ids));
    }

    if (filters?.status) {
      conditions.push(eq(products.status, filters.status));
    }

    if (filters?.productType) {
      conditions.push(eq(products.productType, filters.productType));
    }

    if (filters?.brand) {
      conditions.push(eq(products.brand, filters.brand));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(products.name, searchTerm),
          ilike(products.sku, searchTerm),
          ilike(products.description, searchTerm),
        ),
      );
    }

    const query = this.databaseService.db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    return await query;
  }

  /**
   * Cuenta productos con filtros
   */
  async count(
    organizationId: number,
    filters?: Omit<ProductFilters, 'limit' | 'offset'>,
  ): Promise<number> {
    const conditions = [eq(products.organizationId, organizationId)];

    if (filters?.ids && filters.ids.length > 0) {
      conditions.push(inArray(products.id, filters.ids));
    }

    if (filters?.status) {
      conditions.push(eq(products.status, filters.status));
    }

    if (filters?.productType) {
      conditions.push(eq(products.productType, filters.productType));
    }

    if (filters?.brand) {
      conditions.push(eq(products.brand, filters.brand));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(products.name, searchTerm),
          ilike(products.sku, searchTerm),
          ilike(products.description, searchTerm),
        ),
      );
    }

    const result = await this.databaseService.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));

    return Number(result[0]?.count || 0);
  }

  /**
   * Crea un nuevo producto
   */
  async create(data: NewProduct): Promise<Product> {
    const result = await this.databaseService.db
      .insert(products)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Actualiza un producto
   */
  async update(
    id: number,
    organizationId: number,
    data: Partial<NewProduct>,
  ): Promise<Product | null> {
    const result = await this.databaseService.db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(products.id, id), eq(products.organizationId, organizationId)),
      )
      .returning();

    return result[0] || null;
  }

  /**
   * Elimina un producto
   */
  async delete(id: number, organizationId: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(products)
      .where(
        and(eq(products.id, id), eq(products.organizationId, organizationId)),
      )
      .returning({ id: products.id });

    return result.length > 0;
  }

  /**
   * Encuentra producto por SKU
   */
  async findBySku(
    sku: string,
    organizationId: number,
  ): Promise<Product | null> {
    const result = await this.databaseService.db
      .select()
      .from(products)
      .where(
        and(eq(products.sku, sku), eq(products.organizationId, organizationId)),
      )
      .limit(1);

    return result[0] || null;
  }
}

