import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schemas.js";

type DBEnv = Pick<Env, "DATABASE_URL">

export function createDb(env: DBEnv) {
	const sql = neon(env.DATABASE_URL);

	return drizzle({
		schema,
		client: sql,
	});
}
