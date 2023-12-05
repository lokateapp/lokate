import type { RequestHandler } from './$types';
import { campaignsToBeacons } from "../../../schema";
import { db } from "../../../lib/server/db";
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
        try {
                const { userId, beaconUID } = await request.json();

                // Your logic for joinedBeaconArea
                // console.log(userId, beaconUID);

                // Get the campaign ID that is currently assigned to the given beaconUID from campaignsToBeacons
                const result = await db.select({campaignId: campaignsToBeacons.campaignId})
                    .from(campaignsToBeacons)
                    .where(eq(campaignsToBeacons.beaconId, beaconUID))
                    .limit(1);  // Assuming one campaign per beacon; adjust as needed

                console.log(result);

                if (userId > 0) {
                        const campaignId = result[0].campaignId;

                        return new Response(`campaignID: ${campaignId}`);
                } else {
                        return new Response('Campaign not found for the provided beaconUID', { status: 404 });
                }
        } catch (error) {
                console.error('Error:', error);
                return new Response('Internal Server Error', { status: 500 });
        }
};
