import type { RequestHandler } from './$types';
import { db } from "../../../lib/server/db";
import {beacons, campaigns, campaignsToBeacons, branch} from "../../../schema";
import {and, eq, not} from "drizzle-orm";

// Function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
};

enum Range {
    Unknown = 'unknown',
    Immediate = 'immediate',
    Near = 'near',
    Far = 'far'
}
export const GET: RequestHandler = async ({ url }) => {
    try {
        const latitude = parseFloat(url.searchParams.get('latitude') ?? '0');
        const longitude = parseFloat(url.searchParams.get('longitude') ?? '0');

        const branches = await db.select().from(branch);

        let closestBranch = branches[0];
        let minDistance = calculateDistance(latitude, longitude, closestBranch.latitude, closestBranch.longitude);
        for (const branch of branches) {
            const distance = calculateDistance(latitude, longitude, branch.latitude, branch.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                closestBranch = branch;
            }
        }

        const activeBeacons = await db.select().from(beacons).where(and(not(eq(beacons.radius,0)), eq(beacons.branchId, closestBranch.id)));
        const resultBeacons = [];
        for (const beacon of activeBeacons) {
            const campaignBeacon = await db.select().from(campaignsToBeacons).where(eq(campaignsToBeacons.beaconId, beacon.id)).limit(1);
            if (campaignBeacon.length > 0) {
                const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignBeacon[0].campaignId)).limit(1);
                beacon.campaign = campaign[0];

                // Map radius to range
                const radius = beacon.radius;
                if (radius === 0) {
                    beacon.range = Range.Unknown;
                } else if (radius >= 1 && radius <= 3) {
                    beacon.range = Range.Immediate;
                } else if (radius >= 4 && radius <= 7) {
                    beacon.range = Range.Near;
                } else if (radius >= 8 && radius <= 10) {
                    beacon.range = Range.Far;
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
