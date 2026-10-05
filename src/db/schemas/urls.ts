import {
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

export const urlsTable = pgTable(
	"urls",
	{
		id: uuid().primaryKey().defaultRandom(),
		shortCode: text().notNull(),
		originalUrl: text().notNull(),
		clicks: integer().notNull().default(0),
		expiresAt: timestamp({ withTimezone: true }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [uniqueIndex("urls_short_code_idx").on(table.shortCode)],
);

export const selectUrlsSchema = createSelectSchema(urlsTable);
export const insertUrlsSchema = createInsertSchema(urlsTable, {
	originalUrl: z.url(),
}).omit({
	id: true,
	clicks: true,
	shortCode: true,
	createdAt: true,
	updatedAt: true,
});
export const updateUrlsSchema = createUpdateSchema(urlsTable, {
	originalUrl: z.url(),
})
	.omit({
		id: true,
		clicks: true,
		shortCode: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial();
