import type { RequestHandler } from './$types';
import { db } from "../../../lib/server/db";
import {beacons, campaigns, campaignsToBeacons, SelectBeacon} from "../../../schema";
import {eq, not} from "drizzle-orm";

// export async function GET({ url }): Promise<SelectBeacon[]>
export const GET: RequestHandler = async ({ url }) : Promise<SelectBeacon[]> => {
    try {
        let branchId : string = url.searchParams.get('branchId') ?? '-1';
        const activeBeacons = await db.select().from(beacons).where(not(eq(beacons.radius,0)));
        for (const beacon of activeBeacons) {
            const campaignBeacon = await db.select().from(campaignsToBeacons).where(eq(campaignsToBeacons.beaconId, beacon.id)).limit(1);
            const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignBeacon[0].campaignId)).limit(1);
            beacon.campaign = campaign[0];
        }

        // beaconsWithCampaigns;
        const response = new Response(JSON.stringify(activeBeacons), { status: 200, headers: { 'Content-Type': 'application/json' } });
        return response;
        // it is
    } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
