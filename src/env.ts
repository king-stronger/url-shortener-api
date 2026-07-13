import { config } from "dotenv";
import { z, ZodError } from "zod";
import { expand } from "dotenv-expand";

expand(config())

const envSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(3000)
})

export type env = z.infer<typeof envSchema>

let env: env;

try {
    env = envSchema.parse(process.env)
} catch (e){
    if(e instanceof ZodError){
        console.log("Invalid Environment variable");
        console.error(z.treeifyError(e))
    } else {
        console.error(e)
    }
    process.exit()
}

export default env;