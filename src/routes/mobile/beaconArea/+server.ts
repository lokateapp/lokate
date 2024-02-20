import type { RequestHandler } from './$types';
import {campaignsToBeacons, customers, events} from "../../../schema";
import { db } from "../../../lib/server/db";
import {and, eq} from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { customerId, beaconUID, major, minor, status, timestamp } = await request.json();


        // Get the campaign ID that is currently assigned to the given beaconUID from campaignsToBeacons
        const campaigns = await db.select({campaignId: campaignsToBeacons.campaignId})
            .from(campaignsToBeacons)
            .where(and(eq(campaignsToBeacons.beaconId, beaconUID), eq(campaignsToBeacons.major, major), eq(campaignsToBeacons.minor, minor)));

        if (campaigns.length === 0) {
            return new Response('Campaign not found for the provided beaconUID', { status: 404 });
        }

        const retrivedCustomer = await db.select()
            .from(customers)
            .where(eq(customers.customerId, customerId))
            .limit(1);
        let customer = retrivedCustomer[0];
        if (customer === undefined || customer.length === 0) {
            const newCustomer = {
                id: crypto.randomUUID(),
                customerId: customerId
            };
             await db.insert(customers).values(newCustomer);
             customer = newCustomer;
        }

        const failedEvents = [];
        for( const campaign of campaigns) {
            for (const campaign of campaigns) {
                const newEvent = {
                    id: crypto.randomUUID(),
                    status: status,
                    timestamp: new Date(timestamp * 1000),
                    customerId: customer.id,
                    campaignId: campaign.campaignId,
                };
                await db.insert(events).values(newEvent);
                // let failedEvent = null;
                // if (status === 'ENTER') {
                //     failedEvent =  await handleEnterEvent(timestamp, customer, campaign);
                // } else if (status === 'EXIT') {
                //     failedEvent = await handleExitEvent(timestamp, customer, campaign);
                // }
                // if (failedEvent !== null) {
                //     failedEvents.push(failedEvent);
                // }
            }
        }
        for (const failedEvent of failedEvents) {
            console.log('Failed event for campaign: ' + failedEvent + "for customerId: " + customerId);
        }
        if(failedEvents.length === campaigns.length) {  // all campaigns are not existed yet or not exist any
            return new Response('Failed to add customer to any campaign', { status: 500 });
        }

        const response = "customer with id:" + customer.id + " is added to campaign of beacon with id:" + beaconUID;
        return new Response(response, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
const handleEnterEvent = async (timestamp, customer, campaign) => {
    const event = await db.select()
        .from(events)
        .where(and(eq(events.customerId, customer.id), eq(events.campaignId, campaign.campaignId), eq(events.status, 'ENTER')))
        .limit(1);

    if (event.length !== 0) {
        return campaign.id; // Return the campaign ID for failed events
    }
    const newEvent = {
        id: crypto.randomUUID(),
        status: 'ENTER',
        timestamp: new Date(timestamp * 1000),
        customerId: customer.id,
        campaignId: campaign.campaignId,
    };
    await db.insert(events).values(newEvent);
    return null; // Return null for successful events
};

const handleExitEvent = async ( timestamp, customer, campaign) => {
    const event = await db.select()
        .from(events)
        .where(and(eq(events.customerId, customer.id), eq(events.campaignId, campaign.campaignId), eq(events.status, 'ENTER')))
        .limit(1);

    if (event.length === 0) {
        return campaign.id; // Return the campaign ID for failed events
    }

    await db.update(events)
        .set({status: 'EXIT', timestamp: new Date(timestamp * 1000)})
        .where(and(
            eq(events.id, event[0].id)
        )); // TODO fix the warning for new Date..
    return null; // Return null for successful events
};