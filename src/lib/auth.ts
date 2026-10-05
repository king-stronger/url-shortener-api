import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { createDb } from "../db/db.js";
import env from "../env.js";

type AuthEnv = Pick<
	Env,
	"DATABASE_URL" | "BETTER_AUTH_URL" | "BETTER_AUTH_SECRET" | "TRUSTED_ORIGINS"
>;

export function parseTrustedOrigins(value: string) {
	return value
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
}

export function createAuth(env: AuthEnv) {
	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: parseTrustedOrigins(env.TRUSTED_ORIGINS),
		database: drizzleAdapter(createDb(env), {
			provider: "pg",
		}),
		emailAndPassword: {
			enabled: true,
		},
		advanced: {
			// workers.dev subdomains are distinct sites, so the frontend calls the API cross-site.
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				partitioned: true,
			},
		},
		plugins: [openAPI()],
	});
}

export const auth = createAuth(env);

export type Auth = ReturnType<typeof createAuth>;
