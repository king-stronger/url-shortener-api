import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "@/lib/create-app.js";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatusCodes from "stoker/http-status-codes"
import { createMessageObjectSchema } from "stoker/openapi/schemas";

const router = createRouter()
    .openapi(
        createRoute({
            tags: ["Index"],
            method: "get",
            path: "/",
            responses: {
                [HttpStatusCodes.OK]: jsonContent(
                    createMessageObjectSchema("URL Shortener API"),
                    "URL Shortener API Index"
                )
            }
        }),
        (c) => {
            return c.json(
                {
                    message: "URL Shortener API",
                },
                HttpStatusCodes.OK
            )
        }
    )

export default router;