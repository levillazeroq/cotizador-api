import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';
import { products } from './products';

export const productMedia = pgTable(
  'product_media',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(),
    url: text('url').notNull(),
    position: integer('position').notNull().default(0),
    altText: text('alt_text'),
    title: text('title'),
    description: text('description'),
    fileSize: bigint('file_size', { mode: 'number' }),
    mimeType: varchar('mime_type', { length: 100 }),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      // Check constraint para type
      ckProductMediaType: check(
        'product_media_type_check',
        sql`${table.type} = ANY (ARRAY['image', 'pdf', 'video', 'audio', 'document'])`,
      ),

      // Indexes
      idxProductMediaCreatedAt: index('idx_product_media_created_at').on(
        table.createdAt,
      ),
      idxProductMediaOrganization: index('idx_product_media_organization').on(
        table.organizationId,
      ),
      idxProductMediaPosition: index('idx_product_media_position').on(
        table.productId,
        table.position,
      ),
      idxProductMediaPrimary: index('idx_product_media_primary').on(
        table.productId,
        table.isPrimary,
      ),
      idxProductMediaProduct: index('idx_product_media_product').on(
        table.productId,
      ),
      idxProductMediaProductPosition: index(
        'idx_product_media_product_position',
      ).on(table.productId, table.position),
      idxProductMediaType: index('idx_product_media_type').on(table.type),
      idxProductMediaUpdatedAt: index('idx_product_media_updated_at').on(
        table.updatedAt,
      ),
    };
  },
);

// Relations
export const productMediaRelations = relations(productMedia, ({ one }) => ({
  organization: one(organizations, {
    fields: [productMedia.organizationId],
    references: [organizations.id],
  }),
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

// Zod schemas for validation
export const insertProductMediaSchema = createInsertSchema(productMedia);
export const selectProductMediaSchema = createSelectSchema(productMedia);

// Types
export type ProductMedia = typeof productMedia.$inferSelect;
export type NewProductMedia = typeof productMedia.$inferInsert;

