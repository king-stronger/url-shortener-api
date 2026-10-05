import createApp from "@/lib/create-app.js";
import index from "@/modules/index.js";
import urls from "@/modules/urls/urls.index.js";
import { configureOpenApi } from "./lib/configure-open-api.js";

const app = createApp();

const routes = [index, urls];

configureOpenApi(app);

routes.forEach((route) => {
	app.route("/", route);
});

export default app;
