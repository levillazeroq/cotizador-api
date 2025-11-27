import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';

export const inventoryLocations = pgTable(
  'inventory_location',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 20 })
      .notNull()
      .$type<'warehouse' | 'store' | 'virtual'>(),
    address: jsonb('address').$type<Record<string, any>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      // Check constraint
      ckLocationType: check(
        'inventory_location_type_check',
        sql`${table.type} = ANY (ARRAY['warehouse', 'store', 'virtual'])`,
      ),

      // Unique constraint
      ukInventoryLocationOrgCode: uniqueIndex(
        'uk_inventory_location_org_code',
      ).on(table.organizationId, table.code),

      // Indexes
      idxInventoryLocationOrgId: index('idx_inventory_location_org_id').on(
        table.organizationId,
      ),
      idxInventoryLocationType: index('idx_inventory_location_type').on(
        table.type,
      ),
      idxInventoryLocationCreatedAt: index(
        'idx_inventory_location_created_at',
      ).on(table.createdAt),
      idxInventoryLocationUpdatedAt: index(
        'idx_inventory_location_updated_at',
      ).on(table.updatedAt),
    };
  },
);

// Relations
export const inventoryLocationRelations = relations(
  inventoryLocations,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [inventoryLocations.organizationId],
      references: [organizations.id],
    }),
  }),
);

// Zod schemas for validation
export const insertInventoryLocationSchema = createInsertSchema(inventoryLocations);
export const selectInventoryLocationSchema = createSelectSchema(inventoryLocations);

// Types
export type InventoryLocation = typeof inventoryLocations.$inferSelect;
export type NewInventoryLocation = typeof inventoryLocations.$inferInsert;

