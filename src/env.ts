import { config } from "dotenv";
import { z, ZodError } from "zod";
import { expand } from "dotenv-expand";

expand(config())

const envSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().positive().default(3000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    DB_HOST: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_PORT: z.coerce.number().positive(),
})

const parsed = envSchema.safeParse(process.env)

if(!parsed.success){
    throw new Error(`Invalid error: ${parsed.error.message}`)
}

const env = parsed.data
export default env;