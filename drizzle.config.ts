import env from "@/env.js"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schemas.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        user: env.DB_USER,
        port: env.DB_PORT,
        host: env.DB_HOST,
        database: env.DB_NAME,
        password: env.DB_PASSWORD,
        ssl: false
    }
})