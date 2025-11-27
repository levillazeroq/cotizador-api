import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';
import { priceLists } from './price-lists';
import { products } from './products';

export const productPrices = pgTable(
  'product_price',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    priceListId: bigint('price_list_id', { mode: 'number' })
      .notNull()
      .references(() => priceLists.id, { onDelete: 'cascade' }),
    currency: varchar('currency', { length: 3 }).notNull(),
    amount: numeric('amount', { precision: 18, scale: 4 }).notNull(),
    taxIncluded: boolean('tax_included').notNull().default(false),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validTo: timestamp('valid_to', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      // Check constraints
      ckAmountPositive: check(
        'ck_product_price_amount_positive',
        sql`${table.amount} > 0`,
      ),
      ckValidDates: check(
        'ck_product_price_valid_dates',
        sql`${table.validFrom} IS NULL OR ${table.validTo} IS NULL OR ${table.validFrom} <= ${table.validTo}`,
      ),

      // Unique constraint
      ukProductPriceOrgListProduct: uniqueIndex(
        'uk_product_price_org_list_product',
      ).on(table.organizationId, table.priceListId, table.productId),

      // Indexes
      idxProductPriceActivePrices: index('idx_product_price_active_prices').on(
        table.organizationId,
        table.priceListId,
        table.productId,
        table.validFrom,
        table.validTo,
      ),
      idxProductPriceCreated: index('idx_product_price_created').on(
        table.organizationId,
        table.createdAt,
      ),
      idxProductPriceCreatedAt: index('idx_product_price_created_at').on(
        table.createdAt,
      ),
      idxProductPriceCurrency: index('idx_product_price_currency').on(
        table.currency,
      ),
      idxProductPriceDateRange: index('idx_product_price_date_range').on(
        table.validFrom,
        table.validTo,
      ),
      idxProductPriceDefaultList: index('idx_product_price_default_list').on(
        table.organizationId,
        table.priceListId,
        table.productId,
      ),
      idxProductPriceExpiring: index('idx_product_price_expiring').on(
        table.organizationId,
        table.validTo,
      ),
      idxProductPriceItemsCovering: index('idx_product_price_items_covering').on(
        table.organizationId,
        table.priceListId,
        table.id,
        table.productId,
        table.currency,
        table.amount,
        table.taxIncluded,
        table.validFrom,
        table.validTo,
        table.createdAt,
      ),
      idxProductPriceOrgCurrency: index('idx_product_price_org_currency').on(
        table.organizationId,
        table.currency,
      ),
      idxProductPriceOrgId: index('idx_product_price_org_id').on(
        table.organizationId,
        table.id,
      ),
      idxProductPriceOrgList: index('idx_product_price_org_list').on(
        table.organizationId,
        table.priceListId,
      ),
      idxProductPriceOrgPricelist: index('idx_product_price_org_pricelist').on(
        table.organizationId,
        table.priceListId,
      ),
      idxProductPriceOrgProduct: index('idx_product_price_org_product').on(
        table.organizationId,
        table.productId,
      ),
      idxProductPriceOrganizationId: index(
        'idx_product_price_organization_id',
      ).on(table.organizationId),
      idxProductPricePricelistId: index('idx_product_price_pricelist_id').on(
        table.priceListId,
      ),
      idxProductPriceProductId: index('idx_product_price_product_id').on(
        table.productId,
      ),
      idxProductPriceProductList: index('idx_product_price_product_list').on(
        table.productId,
        table.priceListId,
      ),
      idxProductPriceProductOrg: index('idx_product_price_product_org').on(
        table.productId,
        table.organizationId,
        table.priceListId,
      ),
      idxProductPriceUnique: uniqueIndex('idx_product_price_unique').on(
        table.organizationId,
        table.productId,
        table.priceListId,
      ),
      idxProductPriceUpdatedAt: index('idx_product_price_updated_at').on(
        table.updatedAt,
      ),
      idxProductPriceValidFrom: index('idx_product_price_valid_from').on(
        table.validFrom,
      ),
      idxProductPriceValidTo: index('idx_product_price_valid_to').on(
        table.validTo,
      ),
      idxProductPriceValidity: index('idx_product_price_validity').on(
        table.organizationId,
        table.productId,
        table.validFrom,
        table.validTo,
      ),
      idxProductPriceWithDates: index('idx_product_price_with_dates').on(
        table.organizationId,
        table.priceListId,
        table.productId,
        table.validFrom,
        table.validTo,
      ),
    };
  },
);

// Relations
export const productPriceRelations = relations(productPrices, ({ one }) => ({
  organization: one(organizations, {
    fields: [productPrices.organizationId],
    references: [organizations.id],
  }),
  priceList: one(priceLists, {
    fields: [productPrices.priceListId],
    references: [priceLists.id],
  }),
}));

// Zod schemas for validation
export const insertProductPriceSchema = createInsertSchema(productPrices);
export const selectProductPriceSchema = createSelectSchema(productPrices);

// Types
export type ProductPrice = typeof productPrices.$inferSelect;
export type NewProductPrice = typeof productPrices.$inferInsert;

