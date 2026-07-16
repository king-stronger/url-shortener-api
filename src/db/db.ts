import env from "@/env.js";
import { relations } from "@/db/relations.js";
import { drizzle } from "drizzle-orm/node-postgres"

export const db = drizzle({
    relations,
    connection: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        database: env.DB_NAME,
        password: env.DB_PASSWORD
    }
})