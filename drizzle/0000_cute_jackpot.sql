DO $$ BEGIN
 CREATE TYPE "campaignStatus" AS 
 	ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beaconPositions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"beacon_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"x" integer NOT NULL,
	"y" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"address" varchar(100),
	"latitude" double precision	NOT NULL,
    "longitude" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY NOT NULL,
	"branch_id" uuid NOT NULL,
	"text" text NOT NULL,
	"campaignStatus" "campaignStatus" DEFAULT 'inactive',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beacons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"branch_id" uuid NOT NULL,
	"proximity_uuid" uuid NOT NULL,
    "major" integer NOT NULL,
    "minor" integer NOT NULL,
	"radius" double precision NOT NULL,
	"name" varchar(40),
	CONSTRAINT "unique_proximity_id" UNIQUE("proximity_uuid","major","minor")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaignsToBeacons" (
	"campaign_id" uuid NOT NULL,
	"beacon_id" uuid NOT NULL,
	CONSTRAINT "campaignsToBeacons_campaign_id_beacon_id_pk" PRIMARY KEY("campaign_id","beacon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" varchar(15) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"enterTimestamp" timestamp NOT NULL,
	"possibleExitTimestamp" timestamp NOT NULL,
	"customer_id" uuid NOT NULL,
	"beacon_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_key" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"hashed_password" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_session" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"active_expires" bigint NOT NULL,
	"idle_expires" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_user" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "name_idx" ON "auth_user" ("username");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beaconPositions" ADD CONSTRAINT "beacon_fk" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beacons" ADD CONSTRAINT "beacons_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branches" ADD CONSTRAINT "branches_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaignsToBeacons" ADD CONSTRAINT "campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaignsToBeacons" ADD CONSTRAINT "beacon_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_key" ADD CONSTRAINT "user_key_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION check_branch_id_match()
RETURNS TRIGGER AS
$$
BEGIN
    IF EXISTS (
        SELECT 1 FROM beacons b
        INNER JOIN "campaignsToBeacons" cb ON b.id = cb.beacon_id
        INNER JOIN campaigns c ON cb.campaign_id = c.id
        WHERE b.branch_id <> c.branch_id
    ) THEN
        RAISE EXCEPTION 'Custom Trigger: Branch IDs of beacon and campaign do not match';
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER enforce_branch_id_match
BEFORE INSERT OR UPDATE ON "campaignsToBeacons"
FOR EACH ROW
EXECUTE FUNCTION check_branch_id_match();
