import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(1),
});

export type Environment = z.infer<typeof envSchema>;

export function parseEnv(data: unknown) {
	const { data: env, error } = envSchema.safeParse(data);

	if (error) {
		throw new Error(`Invalid error: ${error.message}`);
	}

	return env;
}

export default parseEnv(process.env);
