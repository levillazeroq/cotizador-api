import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';
import { taxClasses } from './tax-class';
import { priceListConditions } from './price-list-conditions';

export const priceLists = pgTable(
  'price_list',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    pricingTaxMode: varchar('pricing_tax_mode', { length: 20 }),
    taxClassId: bigint('tax_class_id', { mode: 'number' }).references(
      () => taxClasses.id,
      { onDelete: 'set null' },
    ),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      idxPriceListOrgId: index('idx_price_list_org_id').on(
        table.organizationId,
      ),
      idxPriceListOrgDefault: index('idx_price_list_org_default').on(
        table.organizationId,
        table.isDefault,
      ),
      idxPriceListOrgStatus: index('idx_price_list_org_status').on(
        table.organizationId,
        table.status,
      ),
      idxPriceListCurrency: index('idx_price_list_currency').on(table.currency),
      idxPriceListIsDefault: index('idx_price_list_is_default').on(
        table.isDefault,
      ),
      idxPriceListStatus: index('idx_price_list_status').on(table.status),
      idxPriceListTaxClass: index('idx_price_list_tax_class').on(
        table.taxClassId,
      ),
      idxPriceListCreatedAt: index('idx_price_list_created_at').on(
        table.createdAt,
      ),
      idxPriceListUpdatedAt: index('idx_price_list_updated_at').on(
        table.updatedAt,
      ),
      ukPriceListOrgName: uniqueIndex('idx_price_list_org_name_unique').on(
        table.organizationId,
        table.name,
      ),
    };
  },
);

// Relations
export const priceListRelations = relations(priceLists, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [priceLists.organizationId],
    references: [organizations.id],
  }),
  taxClass: one(taxClasses, {
    fields: [priceLists.taxClassId],
    references: [taxClasses.id],
  }),
  conditions: many(priceListConditions),
}));

// Zod schemas for validation
export const insertPriceListSchema = createInsertSchema(priceLists);
export const selectPriceListSchema = createSelectSchema(priceLists);

// Types
export type PriceList = typeof priceLists.$inferSelect;
export type NewPriceList = typeof priceLists.$inferInsert;

