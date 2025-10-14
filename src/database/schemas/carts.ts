import { pgTable, uuid, integer, decimal, timestamp, text, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// Cart Items Table (separate table for relational integrity)
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').notNull(),
  productId: varchar('product_id', { length: 255 }).notNull(),
  name: text('name').notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  size: varchar('size', { length: 50 }),
  color: varchar('color', { length: 50 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  imageUrl: text('image_url'),
  maxStock: integer('max_stock').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Carts Table (simplified without JSON field)
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  totalItems: integer('total_items').notNull().default(0),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Define relations
export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
}))

// Cart Item interface (for backward compatibility and type safety)
export interface CartItem {
  id: string
  cartId: string
  productId: string
  name: string
  sku: string
  size?: string
  color?: string
  price: number
  quantity: number
  imageUrl?: string
  maxStock: number
  createdAt: Date
  updatedAt: Date
}

// Zod schemas for validation
export const insertCartSchema = createInsertSchema(carts)
export const selectCartSchema = createSelectSchema(carts)
export const insertCartItemSchema = createInsertSchema(cartItems)
export const selectCartItemSchema = createSelectSchema(cartItems)

// Type exports
export type Cart = typeof carts.$inferSelect
export type NewCart = typeof carts.$inferInsert
export type CartItemRecord = typeof cartItems.$inferSelect
export type NewCartItem = typeof cartItems.$inferInsert
