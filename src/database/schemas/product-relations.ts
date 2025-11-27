import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';
import { products } from './products';

export const productRelations = pgTable(
  'product_relations',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    relatedProductId: bigint('related_product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    relationType: varchar('relation_type', { length: 20 })
      .notNull()
      .$type<
        | 'related'
        | 'upsell'
        | 'crosssell'
        | 'bundle_item'
        | 'substitute'
        | 'complement'
      >(),
    quantity: numeric('quantity', { precision: 18, scale: 3 }),
    position: integer('position').default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      // Check constraints
      ckNoSelfRelation: check(
        'check_no_self_relation',
        sql`${table.productId} <> ${table.relatedProductId}`,
      ),
      ckRelationType: check(
        'product_relations_relation_type_check',
        sql`${table.relationType} = ANY (ARRAY['related', 'upsell', 'crosssell', 'bundle_item', 'substitute', 'complement'])`,
      ),

      // Unique constraint
      ukProductRelationsOrgProductRelatedType: uniqueIndex(
        'product_relations_organization_id_product_id_related_produc_key',
      ).on(
        table.organizationId,
        table.productId,
        table.relatedProductId,
        table.relationType,
      ),

      // Indexes
      // Note: Indexes with WHERE clauses and INCLUDE columns should be created
      // via SQL migrations. Only basic indexes are defined here.
      idxProductRelationsActive: index('idx_product_relations_active').on(
        table.organizationId,
        table.isActive,
      ),
      idxProductRelationsCreatedAt: index('idx_product_relations_created_at').on(
        table.createdAt,
      ),
      idxProductRelationsOrganization: index(
        'idx_product_relations_organization',
      ).on(table.organizationId),
      idxProductRelationsPosition: index('idx_product_relations_position').on(
        table.productId,
        table.position,
      ),
      idxProductRelationsProduct: index('idx_product_relations_product').on(
        table.productId,
      ),
      idxProductRelationsProductType: index(
        'idx_product_relations_product_type',
      ).on(table.productId, table.relationType, table.position),
      idxProductRelationsRelated: index('idx_product_relations_related').on(
        table.relatedProductId,
      ),
      idxProductRelationsType: index('idx_product_relations_type').on(
        table.relationType,
      ),
      idxProductRelationsUpdatedAt: index('idx_product_relations_updated_at').on(
        table.updatedAt,
      ),
    };
  },
);

// Relations
export const productRelationRelations = relations(
  productRelations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [productRelations.organizationId],
      references: [organizations.id],
    }),
    product: one(products, {
      fields: [productRelations.productId],
      references: [products.id],
      relationName: 'product',
    }),
    relatedProduct: one(products, {
      fields: [productRelations.relatedProductId],
      references: [products.id],
      relationName: 'relatedProduct',
    }),
  }),
);

// Zod schemas for validation
export const insertProductRelationSchema =
  createInsertSchema(productRelations);
export const selectProductRelationSchema =
  createSelectSchema(productRelations);

// Types
export type ProductRelation = typeof productRelations.$inferSelect;
export type NewProductRelation = typeof productRelations.$inferInsert;

