import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { urlsTable } from "./urls.js";

export const DEVICES = ["desktop", "mobile", "bot"] as const;

export const clicksTable = pgTable(
	"clicks",
	{
		id: uuid().primaryKey().defaultRandom(),
		urlId: uuid()
			.notNull()
			.references(() => urlsTable.id, { onDelete: "cascade" }),
		country: text(),
		referrer: text(),
		device: text({ enum: DEVICES }).notNull(),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("clicks_url_id_created_at_idx").on(table.urlId, table.createdAt),
	],
);
