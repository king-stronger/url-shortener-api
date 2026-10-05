import { createRoute, type RouteConfig } from "@hono/zod-openapi";
import { createMiddleware } from "hono/factory";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { createAuth } from "../lib/auth.js";
import type { AppBindings, Session, User } from "../lib/types.js";

interface AuthenticatedBindings {
	Bindings: Env;
	Variables: {
		user: User;
		session: Session;
	};
}

function getSession(env: Env, headers: Headers) {
	return createAuth(env).api.getSession({ headers });
}

export const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
	const session = await getSession(c.env, c.req.raw.headers);

	c.set("user", session?.user ?? null);
	c.set("session", session?.session ?? null);
	await next();
});

export const requireAuth = createMiddleware<AuthenticatedBindings>(
	async (c, next) => {
		const session = await getSession(c.env, c.req.raw.headers);

		if (!session) {
			return c.json(
				{
					message: HttpStatusPhrases.UNAUTHORIZED,
				},
				HttpStatusCodes.UNAUTHORIZED,
			);
		}

		c.set("user", session.user);
		c.set("session", session.session);
		await next();
	},
);

export const unauthorizedResponse = jsonContent(
	createMessageObjectSchema(HttpStatusPhrases.UNAUTHORIZED),
	"Unauthorized",
);

export const protectedRoute = <
	R extends Omit<RouteConfig, "middleware" | "security">,
>(
	options: R,
) =>
	createRoute({
		...options,
		middleware: requireAuth,
		security: [{ cookieAuth: [] }],
		responses: {
			[HttpStatusCodes.UNAUTHORIZED]: unauthorizedResponse,
			...options.responses,
		},
	});

// The empty requirement tells OpenAPI clients that authentication is optional.
const optionalAuthSecurity: NonNullable<RouteConfig["security"]> = [
	{},
	{ cookieAuth: [] },
];

export const optionalRoute = <
	R extends Omit<RouteConfig, "middleware" | "security">,
>(
	options: R,
) =>
	createRoute({
		...options,
		middleware: authMiddleware,
		security: optionalAuthSecurity,
		responses: options.responses,
	});
