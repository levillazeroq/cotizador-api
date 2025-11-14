import {
  pgTable,
  uuid,
  decimal,
  timestamp,
  text,
  varchar,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { carts } from './carts';
import { paymentMethods } from './payment-methods';

// Payment Status Enum
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);

// Payment Type Enum
export const paymentTypeEnum = pgEnum('payment_type', [
  'web_pay',
  'bank_transfer',
  'check',
]);

// Payments Table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id')
    .notNull()
    .references(() => carts.id, { onDelete: 'cascade' }),
  paymentMethodId: uuid('payment_method_id')
    .notNull()
    .references(() => paymentMethods.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  paymentType: paymentTypeEnum('payment_type'),
  proofUrl: text('proof_url'),
  transactionId: varchar('transaction_id', { length: 255 }),
  externalReference: varchar('external_reference', { length: 255 }),
  paymentDate: timestamp('payment_date'),
  confirmedAt: timestamp('confirmed_at'),
  metadata: jsonb('metadata'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Define relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  cart: one(carts, {
    fields: [payments.cartId],
    references: [carts.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [payments.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const cartsPaymentsRelations = relations(carts, ({ many }) => ({
  payments: many(payments),
}));

// Zod schemas for validation
export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

// Type exports
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PaymentType = (typeof paymentTypeEnum.enumValues)[number];

