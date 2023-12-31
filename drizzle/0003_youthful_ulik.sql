CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"user_id" varchar(15) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
