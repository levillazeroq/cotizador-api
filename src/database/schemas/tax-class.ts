import { 
  pgTable, 
  bigserial, 
  bigint,
  varchar, 
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';
import { priceLists } from './price-lists';

export const taxClasses = pgTable(
  'tax_class',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      idxTaxClassOrgId: index('idx_tax_class_org_id').on(table.organizationId),
      idxTaxClassOrgCode: index('idx_tax_class_org_code').on(
        table.organizationId,
        table.code,
      ),
      idxTaxClassOrgDefault: index('idx_tax_class_org_default').on(
        table.organizationId,
        table.isDefault,
      ),
      idxTaxClassStatus: index('idx_tax_class_status').on(table.status),
      idxTaxClassCreatedAt: index('idx_tax_class_created_at').on(table.createdAt),
      idxTaxClassUpdatedAt: index('idx_tax_class_updated_at').on(table.updatedAt),
      ukTaxClassOrgCode: uniqueIndex('uk_tax_class_org_code').on(
        table.organizationId,
        table.code,
      ),
    };
  },
);

// Relations
export const taxClassRelations = relations(taxClasses, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [taxClasses.organizationId],
    references: [organizations.id],
  }),
  priceLists: many(priceLists),
}));

// Zod schemas for validation
export const insertTaxClassSchema = createInsertSchema(taxClasses);
export const selectTaxClassSchema = createSelectSchema(taxClasses);

// Types
export type TaxClass = typeof taxClasses.$inferSelect;
export type NewTaxClass = typeof taxClasses.$inferInsert;

