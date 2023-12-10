import type { RequestHandler } from './$types';
import { db } from "../../../lib/server/db";
import {beacons} from "../../../schema";

export const GET: RequestHandler = async ({ request }) => {
    try {
        const { branchId } = await request.json();
        console.log(branchId);
        const activeBeacons = await db.select().from(beacons);
        return new Response(activeBeacons, {status: 200});
        // it is
    } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
