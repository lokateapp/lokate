CREATE TABLE IF NOT EXISTS "beaconPositions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"beacon_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT '2023-12-12 19:39:53.292',
	"x" integer NOT NULL,
	"y" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "created_at" timestamp DEFAULT '2023-12-12 19:39:53.292';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beaconPositions" ADD CONSTRAINT "beaconPositions_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
