import type { InferSelectModel } from 'drizzle-orm';
import {
	bigint,
	uniqueIndex,
	pgTable,
	varchar,
	uuid,
	text,
	primaryKey,
	integer,
	timestamp
} from 'drizzle-orm/pg-core';

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
		.references(() => user.id),
	radius: integer('radius').notNull(),
	name: varchar('name', { length: 40 }),
	major: varchar('major', { length: 100 }),
	minor: varchar('minor', { length: 100 })
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

export const customers = pgTable('customers', {
	id: uuid('id').primaryKey(),
	customerId: varchar('customer_id', { length: 15 }).notNull()
});

export const events = pgTable('events', {
	id: uuid('id').primaryKey(),
	status: text('status').notNull(),
	timestamp: timestamp('timestamp').notNull(),
	customerId: uuid('customer_id')
		.notNull()
		.references(() => customers.id),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id)
});

export type SelectCampaign = InferSelectModel<typeof campaigns>;
export type SelectBeacon = InferSelectModel<typeof beacons>;
// export type SelectEvent = InferSelectModel<typeof events>;

export type SelectCampaignsWIthBeacons = {
	[campaignsToBeacons._.name]: typeof campaignsToBeacons.$inferSelect;
	[beacons._.name]: typeof beacons.$inferSelect | null;
	[campaigns._.name]: typeof campaigns.$inferSelect | null;
};



export type SelectEvents = {
	[events._.name]: typeof events.$inferSelect;
	[customers._.name]: typeof customers.$inferSelect;
	[campaigns._.name]: typeof campaigns.$inferSelect;
 };
