import { env } from "cloudflare:workers";
import { structuredLogger } from "@hono/structured-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import pino from "pino";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { createAuth, parseTrustedOrigins } from "./auth.js";
import type { AppBindings } from "./types.js";

const rootLogger = pino({
	level: env.LOG_LEVEL,
});

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook,
	});
}

export default function createApp() {
	const app = createRouter();

	app.use(requestId());
	app.use(serveEmojiFavicon(""));
	app.use(
		structuredLogger({
			createLogger: (c) => rootLogger.child({ requestId: c.var.requestId }),
		}),
	);
	app.use(
		cors({
			origin: (origin, c) =>
				parseTrustedOrigins(c.env.TRUSTED_ORIGINS).includes(origin)
					? origin
					: null,
			credentials: true,
			allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
		}),
	);

	app.on(["POST", "GET"], "/api/auth/*", (c) => {
		const auth = createAuth(c.env);
		return auth.handler(c.req.raw);
	});

	app.notFound(notFound);
	app.onError(onError);

	return app;
}
