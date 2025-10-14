import { pgTable, uuid, jsonb, integer, decimal, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// Cart Item interface (stored as JSONB)
export interface CartItem {
  id: string
  productId: string
  name: string
  sku: string
  size?: string
  color?: string
  price: number
  quantity: number
  imageUrl?: string
  maxStock: number
}

// Carts Table
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  items: jsonb('items').$type<CartItem[]>().notNull().default([]),
  totalItems: integer('total_items').notNull().default(0),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Zod schemas for validation
export const insertCartSchema = createInsertSchema(carts)
export const selectCartSchema = createSelectSchema(carts)

// Type exports
export type Cart = typeof carts.$inferSelect
export type NewCart = typeof carts.$inferInsert
