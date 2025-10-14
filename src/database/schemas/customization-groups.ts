import { pgTable, uuid, varchar, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// Customization Groups Table
export const customizationGroups = pgTable('customization_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 500 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Zod schemas for validation
export const insertCustomizationGroupSchema = createInsertSchema(customizationGroups)
export const selectCustomizationGroupSchema = createSelectSchema(customizationGroups)

// Type exports
export type CustomizationGroup = typeof customizationGroups.$inferSelect
export type NewCustomizationGroup = typeof customizationGroups.$inferInsert
