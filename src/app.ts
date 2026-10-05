import { configureOpenApi } from "./lib/configure-open-api.js";
import createApp from "./lib/create-app.js";
import index from "./modules/index.js";
import redirect from "./modules/redirect/redirect.index.js";
import urls from "./modules/urls/urls.index.js";

const app = createApp();

// redirect must stay last: its catch-all "/{shortCode}" would shadow other routes.
const routes = [index, urls, redirect];

configureOpenApi(app);

routes.forEach((route) => {
	app.route("/", route);
});

export default app;
