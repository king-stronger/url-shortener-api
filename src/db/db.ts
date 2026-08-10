import * as schema from "@/db/schemas.js";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http"

export function createDb(databaseUrl: string){
    const sql = neon(databaseUrl)

    return drizzle({
        schema,
        client: sql
    })
}