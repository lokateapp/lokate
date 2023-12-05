import type { RequestHandler } from './$types';
import { db } from "../../lib/server/db";
import { eq } from 'drizzle-orm';
import {beacons, campaigns, campaignsToBeacons, user} from "../../schema";

export const GET: RequestHandler = async () => {
    // create default objects for campaigns beacons user and campaigns to beacons
    // use this for default uidd "userId": "b3fzlv7vwa7whvz", "beaconUID": "550e8400-e29b-41d4-a716-446655440000", campaignId: "138757a6-81c5-4279-9fbf-0dcbfe079a92"
    // first create this objects
    // then add them to db using db.insert
    // then return a response
    // Your logic for buildZero
    await db.insert(user).values( {
        id: 'b3fzlv7vwa7whvz',
        username: 'ahmet123'
    });

    await db.insert(beacons).values( {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'b3fzlv7vwa7whvz'
    });
    await db.insert(campaigns).values( {
        id: '138757a6-81c5-4279-9fbf-0dcbfe079a92',
        userId: 'b3fzlv7vwa7whvz',
        name: 'test campaign',
    });
    await db.insert(campaignsToBeacons).values( {
        campaignId: '138757a6-81c5-4279-9fbf-0dcbfe079a92',
        beaconId: '550e8400-e29b-41d4-a716-446655440000'
    });

    return new Response("Build successful");
};
