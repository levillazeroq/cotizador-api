import { pgTable, bigserial, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const organizations = pgTable(
  'organizations',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    settings: jsonb('settings').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    codeIdx: index('idx_organizations_code').on(table.code),
    statusIdx: index('idx_organizations_status').on(table.status),
    deletedAtIdx: index('idx_organizations_deleted_at').on(table.deletedAt),
  })
);

// Zod schemas for validation
export const insertOrganizationSchema = createInsertSchema(organizations, {
  name: (schema) => schema.min(1, 'Name is required').max(255),
  code: (schema) => schema.min(1, 'Code is required').max(50),
  description: (schema) => schema.optional(),
  status: (schema) => schema.default('active'),
  settings: (schema) => schema.default({}),
});

export const selectOrganizationSchema = createSelectSchema(organizations);

export const updateOrganizationSchema = insertOrganizationSchema.partial();

// Type exports
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

