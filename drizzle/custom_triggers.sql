ALTER DATABASE lokate_dev SET TIMEZONE TO 'Europe/Istanbul';

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
CREATE TRIGGER enforce_branch_id_match_on_campaigns_to_beacons
AFTER INSERT OR UPDATE ON "campaigns_to_beacons"
FOR EACH ROW
EXECUTE FUNCTION check_branch_id_match_on_campaigns_to_beacons();

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
CREATE TRIGGER enforce_branch_id_match_on_beacons_to_floorplans
AFTER INSERT OR UPDATE ON "beacons_to_floorplans"
FOR EACH ROW
EXECUTE FUNCTION check_branch_id_match_on_beacons_to_floorplans();