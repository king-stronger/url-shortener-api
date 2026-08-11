import { defineConfig } from "drizzle-kit";
import env from "@/env.js";

export default defineConfig({
	out: "./src/db/migrations",
	schema: "./src/db/schemas.ts",
	dialect: "postgresql",
	strict: true,
	verbose: true,
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
