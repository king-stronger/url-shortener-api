import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "../../db/db.js";
import { urlsTable } from "../../db/schemas.js";
import type { AppRouteHandler } from "../../lib/types.js";
import { recordClick } from "../../services/click-tracking.js";
import type { RedirectRoute } from "./redirect.routes.js";

export const redirect: AppRouteHandler<RedirectRoute> = async (c) => {
	const db = createDb(c.env);
	const { shortCode } = c.req.valid("param");

	const [url] = await db
		.update(urlsTable)
		.set({
			clicks: sql`${urlsTable.clicks} + 1`,
			// A click is not an edit: keep updatedAt untouched despite $onUpdate.
			updatedAt: sql`${urlsTable.updatedAt}`,
		})
		.where(
			and(
				eq(urlsTable.shortCode, shortCode),
				or(isNull(urlsTable.expiresAt), gt(urlsTable.expiresAt, sql`now()`)),
			),
		)
		.returning({ id: urlsTable.id, originalUrl: urlsTable.originalUrl });

	if (url) {
		c.executionCtx.waitUntil(
			recordClick(db, url.id, c.req.raw).catch((error) => {
				c.var.logger.error({ error, urlId: url.id }, "Failed to record click");
			}),
		);

		return c.redirect(url.originalUrl, HttpStatusCodes.MOVED_TEMPORARILY);
	}

	const [expired] = await db
		.select({ id: urlsTable.id })
		.from(urlsTable)
		.where(eq(urlsTable.shortCode, shortCode))
		.limit(1);

	if (expired) {
		return c.json({ message: HttpStatusPhrases.GONE }, HttpStatusCodes.GONE);
	}

	return c.json(
		{ message: HttpStatusPhrases.NOT_FOUND },
		HttpStatusCodes.NOT_FOUND,
	);
};
