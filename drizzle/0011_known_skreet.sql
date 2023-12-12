DO $$ BEGIN
 CREATE TYPE "campaignStatus" AS ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "beaconPositions" ALTER COLUMN "timestamp" SET DEFAULT '2023-12-12 19:47:35.884';--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "created_at" SET DEFAULT '2023-12-12 19:47:35.884';--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "status" "campaignStatus" DEFAULT 'inactive';