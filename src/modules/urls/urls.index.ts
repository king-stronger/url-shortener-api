import { createRouter } from "@/lib/create-app.js";
import * as handlers from "@/modules/urls/urls.handlers.js";
import * as routes from "@/modules/urls/urls.routes.js";

const router = createRouter()
	.openapi(routes.list, handlers.list)
	.openapi(routes.getOne, handlers.getOne)
	.openapi(routes.create, handlers.create)
	.openapi(routes.update, handlers.update)
	.openapi(routes.remove, handlers.remove);

export default router;
