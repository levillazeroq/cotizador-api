import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  productRelations,
  products,
  type ProductRelation,
} from '../../database/schemas';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';

@Injectable()
export class ProductRelationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Obtiene productos relacionados para un producto específico
   */
  async findRelatedProducts(
    productId: number,
    organizationId: number,
    relationType?: 'related' | 'upsell' | 'crosssell' | 'bundle_item' | 'substitute' | 'complement',
    limit: number = 10,
  ): Promise<Array<ProductRelation & { relatedProduct: typeof products.$inferSelect }>> {
    const conditions = [
      eq(productRelations.productId, productId),
      eq(productRelations.organizationId, organizationId),
      eq(productRelations.isActive, true),
    ];

    if (relationType) {
      conditions.push(
        eq(
          productRelations.relationType,
          relationType as 'related' | 'upsell' | 'crosssell' | 'bundle_item' | 'substitute' | 'complement',
        ),
      );
    }

    const relations = await this.databaseService.db
      .select({
        id: productRelations.id,
        organizationId: productRelations.organizationId,
        productId: productRelations.productId,
        relatedProductId: productRelations.relatedProductId,
        relationType: productRelations.relationType,
        quantity: productRelations.quantity,
        position: productRelations.position,
        isActive: productRelations.isActive,
        createdAt: productRelations.createdAt,
        updatedAt: productRelations.updatedAt,
        relatedProduct: products,
      })
      .from(productRelations)
      .innerJoin(
        products,
        eq(productRelations.relatedProductId, products.id),
      )
      .where(and(...conditions))
      .orderBy(
        desc(productRelations.position),
        desc(productRelations.createdAt),
      )
      .limit(limit);

    return relations;
  }

  /**
   * Obtiene todos los tipos de relaciones para un producto
   */
  async findRelationTypesByProduct(
    productId: number,
    organizationId: number,
  ): Promise<string[]> {
    const result = await this.databaseService.db
      .selectDistinct({ relationType: productRelations.relationType })
      .from(productRelations)
      .where(
        and(
          eq(productRelations.productId, productId),
          eq(productRelations.organizationId, organizationId),
          eq(productRelations.isActive, true),
        ),
      );

    return result.map((r) => r.relationType);
  }
}

