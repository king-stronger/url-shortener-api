import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schemas.js";

export function createDb(env: Env) {
	const sql = neon(env.DATABASE_URL);

	return drizzle({
		schema,
		client: sql,
	});
}
