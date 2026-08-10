import pino from "pino";
import { defaultHook } from "stoker/openapi"
import { requestId } from "hono/request-id";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/lib/types.js";
import { structuredLogger } from "@hono/structured-logger";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

const rootLogger = pino({
    level: "info",
})

export function createRouter(){
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook
    })
}

export default function createApp(){
    const app = createRouter()

    app.use(requestId())
    app.use(serveEmojiFavicon(""))
    app.use(
        structuredLogger({
            createLogger: c => rootLogger.child({ requestId: c.var.requestId })
        })
    )

    app.notFound(notFound)
    app.onError(onError)

    return app;
}