import { customAlphabet } from "nanoid";

export const generateShortCode = customAlphabet(
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	7,
);
