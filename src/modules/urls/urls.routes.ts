import { z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import {
	jsonContent,
	jsonContentOneOf,
	jsonContentRequired,
} from "stoker/openapi/helpers";
import {
	createErrorSchema,
	createMessageObjectSchema,
} from "stoker/openapi/schemas";
import {
	insertUrlsSchema,
	selectUrlsSchema,
	updateUrlsSchema,
} from "../../db/schemas.js";
import {
	optionalRoute,
	protectedRoute,
	unauthorizedResponse,
} from "../../middlewares/auth.js";
import { shortCodeParamsSchema as shortCodeSchema } from "../../services/short-code.js";

const tags = ["Urls"];

const notFoundResponse = jsonContent(
	createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
	"Url not found",
);

const paginationQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const list = protectedRoute({
	tags,
	method: "get",
	path: "/urls",
	request: {
		query: paginationQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				data: z.array(selectUrlsSchema),
				page: z.number(),
				limit: z.number(),
				total: z.number(),
			}),
			"The paginated list of the user's urls",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(paginationQuerySchema),
			"Invalid pagination parameters",
		),
	},
});

export const getOne = protectedRoute({
	tags,
	method: "get",
	path: "/urls/{shortCode}",
	request: {
		params: shortCodeSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectUrlsSchema, "The requested url"),
		[HttpStatusCodes.NOT_FOUND]: notFoundResponse,
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(shortCodeSchema),
			"Invalid short code",
		),
	},
});

export const create = optionalRoute({
	tags,
	method: "post",
	path: "/urls",
	request: {
		body: jsonContentRequired(insertUrlsSchema, "The url to create"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(selectUrlsSchema, "The created url"),
		[HttpStatusCodes.UNAUTHORIZED]: unauthorizedResponse,
		[HttpStatusCodes.CONFLICT]: jsonContent(
			createMessageObjectSchema("Short code already in use"),
			"The custom short code is already taken",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(insertUrlsSchema),
			"The validation(s) error(s)",
		),
	},
});

export const update = protectedRoute({
	tags,
	method: "patch",
	path: "/urls/{shortCode}",
	request: {
		params: shortCodeSchema,
		body: jsonContentRequired(updateUrlsSchema, "The url to update"),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectUrlsSchema, "The updated url"),
		[HttpStatusCodes.NOT_FOUND]: notFoundResponse,
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
			[createErrorSchema(shortCodeSchema), createErrorSchema(updateUrlsSchema)],
			"Invalid shortCode or validation(s) error(s)",
		),
	},
});

export const remove = protectedRoute({
	tags,
	method: "delete",
	path: "/urls/{shortCode}",
	request: {
		params: shortCodeSchema,
	},
	responses: {
		[HttpStatusCodes.NO_CONTENT]: {
			description: "The deleted url",
		},
		[HttpStatusCodes.NOT_FOUND]: notFoundResponse,
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(shortCodeSchema),
			"Invalid shortCode",
		),
	},
});

export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type RemoveRoute = typeof remove;
