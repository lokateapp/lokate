ALTER TABLE "campaignsToBeacons" DROP CONSTRAINT "campaignsToBeacons_campaign_id_campaigns_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaignsToBeacons" ADD CONSTRAINT "campaignsToBeacons_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
