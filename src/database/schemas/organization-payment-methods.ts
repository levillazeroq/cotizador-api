import { pgTable, bigserial, bigint, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizations } from './organizations';

export const organizationPaymentMethods = pgTable(
  'organization_payment_methods',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: bigint('organization_id', { mode: 'number' }).notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    isCheckActive: boolean('is_check_active').notNull().default(false),
    isWebPayActive: boolean('is_web_pay_active').notNull().default(false),
    isBankTransferActive: boolean('is_bank_transfer_active').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_organization_payment_methods_org_id').on(table.organizationId),
  })
);

// Define relations
export const organizationPaymentMethodsRelations = relations(
  organizationPaymentMethods,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationPaymentMethods.organizationId],
      references: [organizations.id],
    }),
  })
);

export const organizationsRelations = relations(organizations, ({ one }) => ({
  paymentMethods: one(organizationPaymentMethods, {
    fields: [organizations.id],
    references: [organizationPaymentMethods.organizationId],
  }),
}));

// Zod schemas for validation
export const insertOrganizationPaymentMethodSchema = createInsertSchema(organizationPaymentMethods, {
  organizationId: (schema) => schema.positive('Organization ID must be positive'),
  isCheckActive: (schema) => schema.default(false),
  isWebPayActive: (schema) => schema.default(false),
  isBankTransferActive: (schema) => schema.default(false),
});

export const selectOrganizationPaymentMethodSchema = createSelectSchema(organizationPaymentMethods);

export const updateOrganizationPaymentMethodSchema = insertOrganizationPaymentMethodSchema.partial().omit({ organizationId: true });

// Type exports
export type OrganizationPaymentMethod = typeof organizationPaymentMethods.$inferSelect;
export type NewOrganizationPaymentMethod = typeof organizationPaymentMethods.$inferInsert;

