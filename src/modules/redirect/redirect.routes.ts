import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import {
	createErrorSchema,
	createMessageObjectSchema,
} from "stoker/openapi/schemas";
import { shortCodeParamsSchema } from "../../services/short-code.js";

const tags = ["Redirect"];

export const redirect = createRoute({
	tags,
	method: "get",
	path: "/{shortCode}",
	request: {
		params: shortCodeParamsSchema,
	},
	responses: {
		[HttpStatusCodes.MOVED_TEMPORARILY]: {
			description: "Redirect to the original url",
		},
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND),
			"Url not found",
		),
		[HttpStatusCodes.GONE]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.GONE),
			"Url expired",
		),
		[HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
			createErrorSchema(shortCodeParamsSchema),
			"Invalid short code",
		),
	},
});

export type RedirectRoute = typeof redirect;
