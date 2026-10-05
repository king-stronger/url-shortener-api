import { z } from "@hono/zod-openapi";
import { customAlphabet } from "nanoid";

// Top-level paths already served by the API; an alias with one of these names could never redirect.
const RESERVED_SHORT_CODES = new Set(["api", "docs", "scalar", "urls"]);

export const generateShortCode = customAlphabet(
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	7,
);

export const shortCodeSchema = z.string().regex(/^[a-zA-Z0-9_-]{3,32}$/);

export const customShortCodeSchema = shortCodeSchema.refine(
	(code) => !RESERVED_SHORT_CODES.has(code.toLowerCase()),
	"This short code is reserved",
);

export const shortCodeParamsSchema = z.object({
	shortCode: shortCodeSchema,
});
