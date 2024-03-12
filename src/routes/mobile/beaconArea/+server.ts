import type { RequestHandler } from './$types';
import {campaignsToBeacons, customers, events} from "../../../schema";
import { db } from "../../../lib/server/db";
import {and, eq} from 'drizzle-orm';

enum EventStatus {
    ENTER = 'ENTER',
    EXIT = 'EXIT',
    STAY = 'STAY'
}
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { customerId, beaconUID, major, minor, status, timestamp } = await request.json();

        // Get the campaign ID that is currently assigned to the given beaconUID from campaignsToBeacons
        const campaigns = await db.select({campaignId: campaignsToBeacons.campaignId})
            .from(campaignsToBeacons)
            .where(and(eq(campaignsToBeacons.beaconId, beaconUID), eq(campaignsToBeacons.beaconMajor, major), eq(campaignsToBeacons.beaconMinor, minor)));

        if (campaigns.length === 0) {
            return new Response('Campaign not found for the provided beaconUID', { status: 404 });
        }

        const customer = await getCustomer(customerId);

        const failedEvents = [];
        for (const campaign of campaigns) {
            let failedEvent = null;
            if (status === EventStatus.ENTER) {
                failedEvent =  await handleEnterEvent(timestamp, customer, campaign);
            }  else if (status === EventStatus.STAY) {
                failedEvent = await handleStayEvent(timestamp, customer, campaign);
            }  else if (status === EventStatus.EXIT) {
                failedEvent = await handleExitEvent(customer, campaign);
            }

            if (failedEvent !== null) {
                failedEvents.push(failedEvent);
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
const getCustomer = async (customerId) => {
    const retrivedCustomer = await db.select()
        .from(customers)
        .where(eq(customers.customerId, customerId))
        .limit(1);
    let customer = retrivedCustomer[0];
    if (customer === undefined || customer.length === 0) {
        customer = handleCreateNewUser(customerId);
    }
    return customer;
}
const handleCreateNewUser = async (customerId) => {
    const newCustomer = {
        id: crypto.randomUUID(),
        customerId: customerId
    };
    await db.insert(customers).values(newCustomer);
    return newCustomer;
}
const handleEnterEvent = async (timestamp, customer, campaign) => {
    const newEvent = {
        id: crypto.randomUUID(),
        status: EventStatus.STAY,
        enterTimestamp: new Date(timestamp),
        possibleExitTimestamp: new Date((timestamp + 10000)), // Add 10 seconds
        customerId: customer.id,
        campaignId: campaign.campaignId,
    };
    await db.insert(events).values(newEvent);
    return null; // Return null for successful events
};
const handleStayEvent = async (timestamp, customer, campaign) => {
    const event = await db.select()
        .from(events)
        .where(and(eq(events.customerId, customer.id), eq(events.campaignId, campaign.campaignId), eq(events.status, EventStatus.STAY)))
        .limit(1);

    if (event.length === 0 || event[0].possibleExitTimestamp >= new Date(timestamp) ) {
        return campaign.id; // Return the campaign ID for failed events
    }

    await db.update(events)
        .set({possibleExitTimestamp: new Date(timestamp)})
        .where(and(
            eq(events.id, event[0].id)
        ));
    return null; // Return null for successful events
};

const handleExitEvent = async (customer, campaign) => {
    const event = await db.select()
        .from(events)
        .where(and(eq(events.customerId, customer.id), eq(events.campaignId, campaign.campaignId), eq(events.status, EventStatus.STAY)))
        .limit(1);

    if (event.length === 0) {
        return campaign.id; // Return the campaign ID for failed events
    }

    await db.update(events)
        .set({status: EventStatus.EXIT})
        .where(and(
            eq(events.id, event[0].id)
        )); // TODO fix the warning for new Date..
    return null; // Return null for successful events
};