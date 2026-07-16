import { db } from "@/db/db.js";
import { eq } from "drizzle-orm";
import { urlsTable } from "@/db/schemas.js";
import type { AppRouteHandler } from "@/lib/types.js"
import { generateShortCode } from "@/lib/short-code.js";
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"
import type { ListRoute, GetOneRoute, CreateRoute, UpdateRoute, RemoveRoute } from "./urls.routes.js";

export const list: AppRouteHandler<ListRoute> = async (c) => {
    const urls = await db.query.urlsTable.findMany()
    return c.json(urls)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
    const { shortCode } = c.req.valid("param");
    const [url] = await db
        .select()
        .from(urlsTable)
        .where(eq(urlsTable.shortCode, shortCode))
        .limit(1)

    if(!url){
        return c.json({
            message: HttpStatusPhrases.NOT_FOUND
        }, HttpStatusCodes.NOT_FOUND)
    }

    const [updated] = await db
        .update(urlsTable)
        .set({
            clicks: url.clicks + 1
        })
        .where(eq(urlsTable.shortCode, shortCode))
        .returning()

    return c.json(
        updated,
        HttpStatusCodes.OK
    )
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
    const data = c.req.valid("json")

    const [url] = await db
        .insert(urlsTable)
        .values(
            {
                ...data,
                shortCode: generateShortCode()
            }
        )
        .returning()

    return c.json(
        url,
        HttpStatusCodes.OK
    )
}

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
    const data = c.req.valid("json")
    const { shortCode } = c.req.valid("param")

    const [url] = await db
        .update(urlsTable)
        .set(data)
        .where(eq(urlsTable.shortCode, shortCode))
        .returning()
    
    if(!url){
        return c.json(
            {
                message: HttpStatusPhrases.NOT_FOUND
            },
            HttpStatusCodes.NOT_FOUND
        )
    }

    return c.json(
        url,
        HttpStatusCodes.OK
    )
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
    const { shortCode } = c.req.valid("param")

    const result = await db
        .delete(urlsTable)
        .where(eq(urlsTable.shortCode, shortCode))

    if(result.rowCount === 0){
        return c.json(
            {
                message: HttpStatusPhrases.NOT_FOUND
            },
            HttpStatusCodes.NOT_FOUND
        )
    }

    return c.body(null, HttpStatusCodes.NO_CONTENT)
}