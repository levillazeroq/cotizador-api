import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { productMedia, type ProductMedia, type NewProductMedia } from '../../database/schemas';
import { eq, and, inArray, asc } from 'drizzle-orm';

@Injectable()
export class ProductMediaRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Encuentra todos los medios de un producto
   */
  async findByProductId(
    productId: number,
    organizationId: number,
  ): Promise<ProductMedia[]> {
    return await this.databaseService.db
      .select()
      .from(productMedia)
      .where(
        and(
          eq(productMedia.productId, productId),
          eq(productMedia.organizationId, organizationId),
        ),
      )
      .orderBy(asc(productMedia.position), asc(productMedia.createdAt));
  }

  /**
   * Encuentra medios de múltiples productos
   */
  async findByProductIds(
    productIds: number[],
    organizationId: number,
  ): Promise<ProductMedia[]> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.databaseService.db
      .select()
      .from(productMedia)
      .where(
        and(
          inArray(productMedia.productId, productIds),
          eq(productMedia.organizationId, organizationId),
        ),
      )
      .orderBy(asc(productMedia.productId), asc(productMedia.position));
  }

  /**
   * Encuentra el medio principal de un producto
   */
  async findPrimaryByProductId(
    productId: number,
    organizationId: number,
  ): Promise<ProductMedia | null> {
    const result = await this.databaseService.db
      .select()
      .from(productMedia)
      .where(
        and(
          eq(productMedia.productId, productId),
          eq(productMedia.organizationId, organizationId),
          eq(productMedia.isPrimary, true),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Crea un nuevo medio
   */
  async create(data: NewProductMedia): Promise<ProductMedia> {
    const result = await this.databaseService.db
      .insert(productMedia)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Actualiza un medio
   */
  async update(
    id: number,
    organizationId: number,
    data: Partial<NewProductMedia>,
  ): Promise<ProductMedia | null> {
    const result = await this.databaseService.db
      .update(productMedia)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(productMedia.id, id),
          eq(productMedia.organizationId, organizationId),
        ),
      )
      .returning();

    return result[0] || null;
  }

  /**
   * Elimina un medio
   */
  async delete(id: number, organizationId: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(productMedia)
      .where(
        and(
          eq(productMedia.id, id),
          eq(productMedia.organizationId, organizationId),
        ),
      )
      .returning({ id: productMedia.id });

    return result.length > 0;
  }
}

