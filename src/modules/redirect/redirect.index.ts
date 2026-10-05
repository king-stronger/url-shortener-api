import { createRouter } from "../../lib/create-app.js";
import * as handlers from "./redirect.handlers.js";
import * as routes from "./redirect.routes.js";

const router = createRouter().openapi(routes.redirect, handlers.redirect);

export default router;
