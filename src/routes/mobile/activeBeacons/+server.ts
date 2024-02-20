import type { RequestHandler } from './$types';
import { db } from "../../../lib/server/db";
import {beacons, campaigns, campaignsToBeacons} from "../../../schema";
import {and, eq, not} from "drizzle-orm";

export const GET: RequestHandler = async ({ url }) => {
    try {
        const branchId : string = url.searchParams.get('branchId') ?? '-1';
        const activeBeacons = await db.select().from(beacons).where(and(not(eq(beacons.radius,0)), eq(beacons.branchId, branchId)));
        const resultBeacons = [];
        for (const beacon of activeBeacons) {
            const campaignBeacon = await db.select().from(campaignsToBeacons).where(eq(campaignsToBeacons.beaconId, beacon.id)).limit(1);
            if (campaignBeacon.length > 0) {
                const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignBeacon[0].campaignId)).limit(1);
                beacon.campaign = campaign[0];

                // Map radius to range
                const radius = beacon.radius;
                if (radius === 0) {
                    beacon.range = 'invalid';
                } else if (radius >= 1 && radius <= 3) {
                    beacon.range = 'immediate';
                } else if (radius >= 4 && radius <= 7) {
                    beacon.range = 'near';
                } else if (radius >= 8 && radius <= 10) {
                    beacon.range = 'far';
                }

                resultBeacons.push(beacon);
            }
        }

        const response = new Response(JSON.stringify(resultBeacons), { status: 200, headers: { 'Content-Type': 'application/json' } });
        return response;
    } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
