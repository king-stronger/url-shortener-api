import type { createDb } from "../db/db.js";
import { clicksTable, type DEVICES } from "../db/schemas.js";

type Device = (typeof DEVICES)[number];

const BOT_PATTERN =
	/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|discord/i;
const MOBILE_PATTERN = /mobile|android|iphone|ipad|ipod/i;

function detectDevice(userAgent: string | null): Device {
	if (!userAgent || BOT_PATTERN.test(userAgent)) {
		return "bot";
	}

	return MOBILE_PATTERN.test(userAgent) ? "mobile" : "desktop";
}

function referrerHost(referer: string | null) {
	if (!referer) {
		return null;
	}

	try {
		return new URL(referer).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
}

export function recordClick(
	db: ReturnType<typeof createDb>,
	urlId: string,
	request: Request,
) {
	// Requests received by the Worker always carry the incoming variant of `cf`.
	const cf = request.cf as IncomingRequestCfProperties | undefined;

	return db.insert(clicksTable).values({
		urlId,
		country: cf?.country ?? null,
		referrer: referrerHost(request.headers.get("referer")),
		device: detectDevice(request.headers.get("user-agent")),
	});
}
