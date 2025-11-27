import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';
import { priceLists } from './price-lists';

export const priceListConditions = pgTable(
  'price_list_condition',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    priceListId: bigint('price_list_id', { mode: 'number' })
      .notNull()
      .references(() => priceLists.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    conditionType: varchar('condition_type', { length: 50 }).notNull(),
    operator: varchar('operator', { length: 20 }).notNull().default('equals'),
    conditionValue: jsonb('condition_value').notNull(),
    config: jsonb('config'),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validTo: timestamp('valid_to', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      idxPriceListCondOrg: index('idx_price_list_cond_org').on(
        table.organizationId,
      ),
      idxPriceListCondPriceList: index('idx_price_list_cond_price_list').on(
        table.priceListId,
      ),
      idxPriceListCondListOrg: index('idx_price_list_cond_list_org').on(
        table.priceListId,
        table.organizationId,
      ),
      idxPriceListCondType: index('idx_price_list_cond_type').on(
        table.conditionType,
      ),
      idxPriceListCondStatus: index('idx_price_list_cond_status').on(
        table.status,
      ),
      idxPriceListCondValidDates: index(
        'idx_price_list_cond_valid_dates',
      ).on(table.validFrom, table.validTo),
      idxPriceListCondCreatedAt: index('idx_price_list_cond_created_at').on(
        table.createdAt,
      ),
      idxPriceListCondUpdatedAt: index('idx_price_list_cond_updated_at').on(
        table.updatedAt,
      ),
    };
  },
);

// Relations
export const priceListConditionRelations = relations(
  priceListConditions,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [priceListConditions.organizationId],
      references: [organizations.id],
    }),
    priceList: one(priceLists, {
      fields: [priceListConditions.priceListId],
      references: [priceLists.id],
    }),
  }),
);

// Zod schemas for validation
export const insertPriceListConditionSchema = createInsertSchema(priceListConditions);
export const selectPriceListConditionSchema = createSelectSchema(priceListConditions);

// Types
export type PriceListCondition = typeof priceListConditions.$inferSelect;
export type NewPriceListCondition = typeof priceListConditions.$inferInsert;

