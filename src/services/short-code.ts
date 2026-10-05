import { z } from "@hono/zod-openapi";
import { customAlphabet } from "nanoid";

export const generateShortCode = customAlphabet(
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	7,
);

export const shortCodeParamsSchema = z.object({
	shortCode: z.string().regex(/^[a-zA-Z0-9_-]{3,32}$/),
});
