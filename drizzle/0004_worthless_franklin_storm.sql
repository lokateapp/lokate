CREATE TABLE IF NOT EXISTS "beacons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaignsToBeacons" (
	"campaign_id" uuid NOT NULL,
	"beacon_id" uuid NOT NULL,
	CONSTRAINT campaignsToBeacons_campaign_id_beacon_id PRIMARY KEY("campaign_id","beacon_id"),
	CONSTRAINT "campaignsToBeacons_campaign_id_unique" UNIQUE("campaign_id"),
	CONSTRAINT "campaignsToBeacons_beacon_id_unique" UNIQUE("beacon_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beacons" ADD CONSTRAINT "beacons_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaignsToBeacons" ADD CONSTRAINT "campaignsToBeacons_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaignsToBeacons" ADD CONSTRAINT "campaignsToBeacons_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
