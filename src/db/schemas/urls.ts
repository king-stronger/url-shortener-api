import {
	index,
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
import { customShortCodeSchema } from "../../services/short-code.js";
import { user } from "./auth.js";

export const urlsTable = pgTable(
	"urls",
	{
		id: uuid().primaryKey().defaultRandom(),
		shortCode: text().notNull(),
		originalUrl: text().notNull(),
		clicks: integer().notNull().default(0),
		userId: text().references(() => user.id, { onDelete: "cascade" }),
		expiresAt: timestamp({ withTimezone: true }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("urls_short_code_idx").on(table.shortCode),
		index("urls_user_id_idx").on(table.userId),
	],
);

export const selectUrlsSchema = createSelectSchema(urlsTable);
export const insertUrlsSchema = createInsertSchema(urlsTable, {
	originalUrl: z.url(),
	shortCode: customShortCodeSchema.optional(),
}).omit({
	id: true,
	clicks: true,
	userId: true,
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
		userId: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial()
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided",
	});
