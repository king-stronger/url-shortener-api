import { and, desc, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createDb } from "../../db/db.js";
import { urlsTable } from "../../db/schemas.js";
import type { AppRouteHandler } from "../../lib/types.js";
import { generateShortCode } from "../../services/short-code.js";
import type {
	CreateRoute,
	GetOneRoute,
	ListRoute,
	RemoveRoute,
	UpdateRoute,
} from "./urls.routes.js";

const MAX_SHORT_CODE_ATTEMPTS = 3;

const ownedUrl = (shortCode: string, userId: string) =>
	and(eq(urlsTable.shortCode, shortCode), eq(urlsTable.userId, userId));

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const db = createDb(c.env);
	const { page, limit } = c.req.valid("query");
	const where = eq(urlsTable.userId, c.var.user.id);

	const [data, total] = await Promise.all([
		db
			.select()
			.from(urlsTable)
			.where(where)
			.orderBy(desc(urlsTable.createdAt))
			.limit(limit)
			.offset((page - 1) * limit),
		db.$count(urlsTable, where),
	]);

	return c.json({ data, page, limit, total }, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const db = createDb(c.env);
	const { shortCode } = c.req.valid("param");
	const [url] = await db
		.select()
		.from(urlsTable)
		.where(ownedUrl(shortCode, c.var.user.id))
		.limit(1);

	if (!url) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(url, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const db = createDb(c.env);
	const { shortCode: customShortCode, ...data } = c.req.valid("json");
	const user = c.var.user;

	const insert = (shortCode: string) =>
		db
			.insert(urlsTable)
			.values({ ...data, shortCode, userId: user?.id ?? null })
			.onConflictDoNothing({ target: urlsTable.shortCode })
			.returning();

	if (customShortCode) {
		if (!user) {
			return c.json(
				{
					message: HttpStatusPhrases.UNAUTHORIZED,
				},
				HttpStatusCodes.UNAUTHORIZED,
			);
		}

		const [url] = await insert(customShortCode);

		if (!url) {
			return c.json(
				{
					message: "Short code already in use",
				},
				HttpStatusCodes.CONFLICT,
			);
		}

		return c.json(url, HttpStatusCodes.CREATED);
	}

	for (let attempt = 0; attempt < MAX_SHORT_CODE_ATTEMPTS; attempt++) {
		const [url] = await insert(generateShortCode());

		if (url) {
			return c.json(url, HttpStatusCodes.CREATED);
		}
	}

	throw new Error("Could not generate a unique short code");
};

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
	const db = createDb(c.env);
	const data = c.req.valid("json");
	const { shortCode } = c.req.valid("param");

	const [url] = await db
		.update(urlsTable)
		.set(data)
		.where(ownedUrl(shortCode, c.var.user.id))
		.returning();

	if (!url) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(url, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
	const db = createDb(c.env);
	const { shortCode } = c.req.valid("param");

	const result = await db
		.delete(urlsTable)
		.where(ownedUrl(shortCode, c.var.user.id));

	if (result.rowCount === 0) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.body(null, HttpStatusCodes.NO_CONTENT);
};
