import { pgTable, text, boolean, integer, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const customizationFields = pgTable('customization_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull(),
  name: text('name').notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['text', 'number', 'select', 'checkbox', 'textarea'] }).notNull(),
  options: jsonb('options'), // JSON object for select options
  isRequired: boolean('is_required').default(true),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  minValue: integer('min_value'),
  maxValue: integer('max_value'),
  maxLength: integer('max_length'),
  imageConstraints: jsonb('image_constraints'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CustomizationField = typeof customizationFields.$inferSelect;
export type NewCustomizationField = typeof customizationFields.$inferInsert;
