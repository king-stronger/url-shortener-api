import * as schema from "@/db/schemas.js"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema)