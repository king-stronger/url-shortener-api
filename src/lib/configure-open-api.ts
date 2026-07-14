import type { AppOpenApi } from "./types.js";
import { Scalar } from "@scalar/hono-api-reference";
import packageJson from "../../package.json" with { type: "json"}

export function configureOpenApi(app: AppOpenApi){
	app.doc("/doc", {
		openapi: "3.2.0",
		info: {
			version: packageJson.version,
			title: "URL Shortener"
		}
	})

	app.get("/scalar", Scalar({
		url: "/doc",
		theme: "kepler",
		layout: "modern",
		defaultHttpClient: {
			targetKey: "js",
			clientKey: "fetch"
		}
	}))
}