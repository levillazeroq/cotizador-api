import { pgTable, uuid, varchar, boolean, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// Enums
export const paymentMethodTypeEnum = pgEnum('payment_method_type', ['webpay', 'transfer', 'check'])

// Payment Methods Table
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  type: paymentMethodTypeEnum('type').notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  requiresProof: boolean('requires_proof').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Zod schemas for validation
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods)
export const selectPaymentMethodSchema = createSelectSchema(paymentMethods)

// Type exports
export type PaymentMethod = typeof paymentMethods.$inferSelect
export type NewPaymentMethod = typeof paymentMethods.$inferInsert
export type PaymentMethodType = typeof paymentMethodTypeEnum.enumValues[number]
