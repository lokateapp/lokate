ALTER DATABASE lokate_dev SET TIMEZONE TO 'Europe/Istanbul';
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "campaignStatus" AS 
 	ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"address" varchar(100),
	"latitude" double precision	NOT NULL,
    "longitude" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "floorplans" (
	"id" uuid PRIMARY KEY NOT NULL,
	"branch_id" uuid NOT NULL,
	"img_path" text NOT NULL,
	--> width and height is for scaling beacon radius on floorplan image
	"width" integer NOT NULL,
	"height" integer NOT NULL
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
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY NOT NULL,
	"branch_id" uuid NOT NULL,
	"text" text NOT NULL,
	"campaign_status" "campaignStatus" DEFAULT 'inactive',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns_to_beacons" (
	"campaign_id" uuid NOT NULL,
	"beacon_id" uuid NOT NULL,
	CONSTRAINT "campaigns_to_beacons_campaign_id_beacon_id_pk" PRIMARY KEY("campaign_id","beacon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beacons_to_floorplans" (
	"beacon_id" uuid NOT NULL,
	"floorplan_id" uuid NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	CONSTRAINT "beacons_to_floorplans_beacon_id_floorplan_id_pk" PRIMARY KEY("beacon_id","floorplan_id")
)
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" varchar(15) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"enter_timestamp" timestamp with time zone NOT NULL,
	"possible_exit_timestamp" timestamp with time zone NOT NULL,
	-- although it may seem that we can obtain below three fields by some joins, those fields will
	-- correspond to up-to-date information about beacon position and radius, but a beacon position
	-- or radius might be changed after the occurrence of an event. Therefore we need to save the
	-- position and radius at the time event occurred.
	"location_x" integer NOT NULL,	
	"location_y" integer NOT NULL,
	"radius" double precision NOT NULL,
	"customer_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"beacon_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL
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
CREATE TABLE IF NOT EXISTS "product_groups" (
   "id" uuid PRIMARY KEY NOT NULL,
   "group_name" varchar(40) NOT NULL
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_groups_to_campaigns" (
    "campaign_id" uuid NOT NULL,
    "product_group_id" uuid NOT NULL,
    CONSTRAINT product_groups_to_campaigns_campaign_id_product_group_id PRIMARY KEY("campaign_id","product_group_id")
    );
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beacons" ADD CONSTRAINT "beacons_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "floorplans" ADD CONSTRAINT "floorplans_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns_to_beacons" ADD CONSTRAINT "campaigns_to_beacons_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns_to_beacons" ADD CONSTRAINT "campaigns_to_beacons_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beacons_to_floorplans" ADD CONSTRAINT "beacons_to_floorplans_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "beacons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beacons_to_floorplans" ADD CONSTRAINT "beacons_to_floorplans_floorplan_id_floorplans_id_fk" FOREIGN KEY ("floorplan_id") REFERENCES "floorplans"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "events" ADD CONSTRAINT "events_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "events" ADD CONSTRAINT "events_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE no action ON UPDATE no action;
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
DO $$ BEGIN
ALTER TABLE "product_groups_to_campaigns" ADD CONSTRAINT "product_groups_to_campaigns_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "product_groups_to_campaigns" ADD CONSTRAINT "product_groups_to_campaigns_product_group_id_product_groups_id_fk" FOREIGN KEY ("product_group_id") REFERENCES "product_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION check_branch_id_match_on_campaigns_to_beacons()
RETURNS TRIGGER AS
$$
BEGIN
    IF EXISTS (
        SELECT 1 FROM beacons b
        INNER JOIN "campaigns_to_beacons" cb ON b.id = cb.beacon_id
        INNER JOIN campaigns c ON cb.campaign_id = c.id
        WHERE b.branch_id <> c.branch_id
    ) THEN
        RAISE EXCEPTION 'Branch IDs of beacon and campaign do not match';
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER enforce_branch_id_match_on_campaigns_to_beacons
AFTER INSERT OR UPDATE ON "campaigns_to_beacons"
FOR EACH ROW
EXECUTE FUNCTION check_branch_id_match_on_campaigns_to_beacons();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION check_branch_id_match_on_beacons_to_floorplans()
RETURNS TRIGGER AS
$$
BEGIN
    IF EXISTS (
        SELECT 1 FROM floorplans f
        INNER JOIN "beacons_to_floorplans" bf ON f.id = bf.floorplan_id
        INNER JOIN beacons b ON bf.beacon_id = b.id
        WHERE f.branch_id <> b.branch_id
    ) THEN
        RAISE EXCEPTION 'Branch IDs of floorplan and beacon do not match';
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER enforce_branch_id_match_on_beacons_to_floorplans
AFTER INSERT OR UPDATE ON "beacons_to_floorplans"
FOR EACH ROW
EXECUTE FUNCTION check_branch_id_match_on_beacons_to_floorplans();
