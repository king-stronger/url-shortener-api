import * as schema from "@/db/schemas.js";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http"

export function createDb(env: Env){
    const sql = neon(env.DATABASE_URL)

    return drizzle({
        schema,
        client: sql
    })
}