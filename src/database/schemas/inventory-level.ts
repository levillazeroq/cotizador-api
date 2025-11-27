import {
  pgTable,
  bigserial,
  bigint,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';
import { products } from './products';
import { inventoryLocations } from './inventory-location';

export const inventoryLevels = pgTable(
  'inventory_level',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    locationId: bigint('location_id', { mode: 'number' })
      .notNull()
      .references(() => inventoryLocations.id, { onDelete: 'cascade' }),
    onHand: numeric('on_hand', { precision: 18, scale: 3 })
      .notNull()
      .default('0'),
    reserved: numeric('reserved', { precision: 18, scale: 3 })
      .notNull()
      .default('0'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      // Unique constraint
      ukInventoryLevelOrgProductLocation: uniqueIndex(
        'uk_inventory_level_org_product_location',
      ).on(table.organizationId, table.productId, table.locationId),

      // Indexes
      idxInventoryLevelOrgProduct: index('idx_inventory_level_org_product').on(
        table.organizationId,
        table.productId,
      ),
      idxInventoryLevelLocation: index('idx_inventory_level_location').on(
        table.locationId,
      ),
      idxInventoryLevelProduct: index('idx_inventory_level_product').on(
        table.productId,
      ),
      idxInventoryLevelCreatedAt: index('idx_inventory_level_created_at').on(
        table.createdAt,
      ),
      idxInventoryLevelUpdatedAt: index('idx_inventory_level_updated_at').on(
        table.updatedAt,
      ),
    };
  },
);

// Relations
export const inventoryLevelRelations = relations(
  inventoryLevels,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [inventoryLevels.organizationId],
      references: [organizations.id],
    }),
    product: one(products, {
      fields: [inventoryLevels.productId],
      references: [products.id],
    }),
    location: one(inventoryLocations, {
      fields: [inventoryLevels.locationId],
      references: [inventoryLocations.id],
    }),
  }),
);

// Zod schemas for validation
export const insertInventoryLevelSchema = createInsertSchema(inventoryLevels);
export const selectInventoryLevelSchema = createSelectSchema(inventoryLevels);

// Types
export type InventoryLevel = typeof inventoryLevels.$inferSelect;
export type NewInventoryLevel = typeof inventoryLevels.$inferInsert;

