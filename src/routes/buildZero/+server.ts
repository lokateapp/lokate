import type { RequestHandler } from './$types';
import { db } from '../../lib/server/db';
import { beacons, campaigns, campaignsToBeacons, user } from '../../schema';
import { auth } from '$lib/server/lucia';
import crypto from 'crypto';

export const GET: RequestHandler = async ({ url }) => {
	let userId;
	if (url.searchParams.get('userId')) {
		userId = Number(url.searchParams.get('userId'));
	} else {
		const user = await auth.createUser({
			key: {
				providerId: 'username', // auth method
				providerUserId: 'asd'.toLowerCase(), // unique id when using "username" auth method
				password: 'qwe' // hashed by Lucia
			},
			attributes: {
				username: 'asd'
			}
		});
		userId = user.userId;
	}

	const beacon1_id = crypto.randomUUID();
	await db.insert(beacons).values({
		id: beacon1_id,
		userId: userId,
		radius: 0,
		major: '100',
		minor: '12',
		name: 'test beacon 1'
	});

	const beacon2_id = crypto.randomUUID();
	await db.insert(beacons).values({
		id: beacon2_id,
		userId: userId,
		radius: 1,
		major: '100',
		minor: '12',
		name: 'test beacon 2'
	});

	const campaing1_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaing1_id,
		userId: userId,
		name: 'test campaign1'
	});
	const campaing2_id = crypto.randomUUID();
	await db.insert(campaigns).values({
		id: campaing2_id,
		userId: userId,
		name: 'test campaign2'
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaing1_id,
		beaconId: beacon1_id
	});

	await db.insert(campaignsToBeacons).values({
		campaignId: campaing2_id,
		beaconId: beacon2_id
	});

	// Build the response object with information about the created entities
	const responseObj = {
		createdBeacons: [
			{ id: beacon1_id, name: 'test beacon 1' },
			{ id: beacon2_id, name: 'test beacon 2' }
		],
		createdCampaigns: [
			{ id: campaing1_id, name: 'test campaign1' },
			{ id: campaing2_id, name: 'test campaign2' }
		],
		createdCampaignsToBeacons: [
			{ campaignId: campaing1_id, beaconId: beacon1_id },
			{ campaignId: campaing2_id, beaconId: beacon2_id }
		]
	};

	// Convert the response object to JSON and include it in the response
	const responseBody = JSON.stringify(responseObj);

	return new Response(responseBody, {
		headers: { 'Content-Type': 'application/json' }
	});};
