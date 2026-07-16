import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const urlsTable = pgTable("urls", {
    id: uuid().primaryKey().defaultRandom(),
    shortCode: text().notNull(),
    originalUrl: text().notNull(),
    clicks: integer().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()
})

export const selectUrlsSchema = createSelectSchema(urlsTable)
export const createUrlsSchema = createInsertSchema(urlsTable)
export const updateateUrlsSchema = createUpdateSchema(urlsTable)