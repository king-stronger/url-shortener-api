import type {
	OpenAPIHono,
	RouteConfig,
	RouteConfigToEnv,
	RouteHandler,
} from "@hono/zod-openapi";
import type { Logger } from "pino";
import type { Auth } from "./auth.js";

export type User = Auth["$Infer"]["Session"]["user"];
export type Session = Auth["$Infer"]["Session"]["session"];

export interface AppBindings {
	Bindings: Env;
	Variables: {
		logger: Logger;
		user: User | null;
		session: Session | null;
	};
}

export type AppOpenApi = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings & RouteConfigToEnv<R>
>;
