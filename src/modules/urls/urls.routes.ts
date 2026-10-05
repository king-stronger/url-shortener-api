import { createRoute, z } from "@hono/zod-openapi";
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
import { shortCodeParamsSchema as shortCodeSchema } from "../../services/short-code.js";

const tags = ["Urls"];

export const list = createRoute({
	tags,
	method: "get",
	path: "/urls",
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectUrlsSchema),
			"The list of urls",
		),
	},
});

export const getOne = createRoute({
	tags,
	method: "get",
	path: "/urls/{shortCode}",
	request: {
		params: shortCodeSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectUrlsSchema, "The requested url"),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Url not found",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(shortCodeSchema),
			"Invalid short code",
		),
	},
});

export const create = createRoute({
	tags,
	method: "post",
	path: "/urls",
	request: {
		body: jsonContentRequired(insertUrlsSchema, "The url to create"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(selectUrlsSchema, "The created url"),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(insertUrlsSchema),
			"The validation(s) error(s)",
		),
	},
});

export const update = createRoute({
	tags,
	method: "patch",
	path: "/urls/{shortCode}",
	request: {
		params: shortCodeSchema,
		body: jsonContent(updateUrlsSchema, "The url to update"),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectUrlsSchema, "The updated url"),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Url not found",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
			[createErrorSchema(shortCodeSchema), createErrorSchema(updateUrlsSchema)],
			"Invalid shortCode or validation(s) error(s)",
		),
	},
});

export const remove = createRoute({
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
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Url not found",
		),
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
