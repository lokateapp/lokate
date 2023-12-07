import type { InferSelectModel } from 'drizzle-orm';
import { bigint, uniqueIndex, pgTable, varchar, uuid, text, primaryKey } from 'drizzle-orm/pg-core';

export const user = pgTable(
	'auth_user',
	{
		id: varchar('id', {
			length: 15
		}).primaryKey(),
		username: varchar('username', { length: 64 }).notNull()
	},
	(user) => {
		return {
			nameIndex: uniqueIndex('name_idx').on(user.username)
		};
	}
);

export const session = pgTable('user_session', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	activeExpires: bigint('active_expires', {
		mode: 'number'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'number'
	}).notNull()
});

export const key = pgTable('user_key', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	hashedPassword: varchar('hashed_password', {
		length: 255
	})
});

export const beacons = pgTable('beacons', {
	id: uuid('id').primaryKey(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => user.id)
});

export const campaignsToBeacons = pgTable(
	'campaignsToBeacons',
	{
		campaignId: uuid('campaign_id')
			.notNull()
			.unique()
			.references(() => campaigns.id, { onDelete: 'cascade' }),
		beaconId: uuid('beacon_id')
			.notNull()
			.unique()
			.references(() => beacons.id, { onDelete: 'cascade' })
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.campaignId, table.beaconId] })
		};
	}
);

export const campaigns = pgTable('campaigns', {
	id: uuid('id').primaryKey(),
	name: text('text').notNull(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => user.id)
});

export type SelectCampaign = InferSelectModel<typeof campaigns>;
