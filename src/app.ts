import index from "@/routes/index.js"
import urls from "@/routes/urls/urls.index.js"
import createApp from "@/lib/create-app.js";
import { configureOpenApi } from "./lib/configure-open-api.js";

const app = createApp();

const routes = [
    index,
    urls
]

configureOpenApi(app)

routes.forEach(route => {
    app.route("/", route)
})

export default app;