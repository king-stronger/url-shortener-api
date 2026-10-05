import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import type { createDb } from "../db/db.js";
import { clicksTable } from "../db/schemas.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_LIMIT = 5;

function fillMissingDays(
	rows: { date: string; clicks: number }[],
	since: Date,
	days: number,
) {
	const clicksByDate = new Map(rows.map((row) => [row.date, row.clicks]));

	return Array.from({ length: days }, (_, offset) => {
		const date = new Date(since.getTime() + offset * DAY_MS)
			.toISOString()
			.slice(0, 10);
		return { date, clicks: clicksByDate.get(date) ?? 0 };
	});
}

export async function getClickStats(
	db: ReturnType<typeof createDb>,
	urlId: string,
	days: number,
) {
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);
	const since = new Date(today.getTime() - (days - 1) * DAY_MS);

	const inPeriod = and(
		eq(clicksTable.urlId, urlId),
		gte(clicksTable.createdAt, since),
	);
	const day = sql<string>`to_char(${clicksTable.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;

	const [byDay, countries, referrers, devices] = await db.batch([
		db
			.select({ date: day, clicks: count() })
			.from(clicksTable)
			.where(inPeriod)
			.groupBy(day),
		db
			.select({ country: clicksTable.country, clicks: count() })
			.from(clicksTable)
			.where(inPeriod)
			.groupBy(clicksTable.country)
			.orderBy(desc(count()))
			.limit(TOP_LIMIT),
		db
			.select({ referrer: clicksTable.referrer, clicks: count() })
			.from(clicksTable)
			.where(inPeriod)
			.groupBy(clicksTable.referrer)
			.orderBy(desc(count()))
			.limit(TOP_LIMIT),
		db
			.select({ device: clicksTable.device, clicks: count() })
			.from(clicksTable)
			.where(inPeriod)
			.groupBy(clicksTable.device)
			.orderBy(desc(count())),
	]);

	return {
		clicksByDay: fillMissingDays(byDay, since, days),
		topCountries: countries,
		topReferrers: referrers,
		devices,
	};
}
