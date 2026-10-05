ALTER TABLE "urls" ADD COLUMN "userId" text;--> statement-breakpoint
ALTER TABLE "urls" ADD CONSTRAINT "urls_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "urls_user_id_idx" ON "urls" USING btree ("userId");