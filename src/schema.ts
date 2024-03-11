import { relations, type InferSelectModel, sql } from 'drizzle-orm';
import {
	bigint,
	uniqueIndex,
	pgTable,
	varchar,
	uuid,
	text,
	primaryKey,
	integer,
	timestamp,
	pgEnum,
	doublePrecision
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

export const branches = pgTable('branches', {
	id: uuid('id').primaryKey(),
	address: varchar('address', { length: 100 }).notNull(),
	latitude: doublePrecision('latitude').notNull(),
	longitude: doublePrecision('longitude').notNull()
});

export const beacons = pgTable('beacons', {
	id: uuid('id').primaryKey(),
	proximityUUID: uuid('proximity_uuid').notNull(),
	major: integer('major').notNull(),
	minor: integer('minor').notNull(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => user.id),
	branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
	radius: doublePrecision('radius').notNull(),
	name: varchar('name', { length: 40 })
});

export const campaignsToBeacons = pgTable(
	'campaignsToBeacons',
	{
		campaignId: uuid('campaign_id')
			.notNull()
			.references(() => campaigns.id, { onDelete: 'cascade' }),
		beaconId: uuid('beacon_id')
			.notNull()
			.references(() => beacons.id, { onDelete: 'cascade' })
		// TODO  we should remove onDelete since it does not work with multiple priamry keys
		// refer to https://www.answeroverflow.com/m/1182472423266856970 and https://github.com/drizzle-team/drizzle-orm/pull/1636
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.campaignId, table.beaconId] })
		};
	}
);

export const campaignStatusEnum = pgEnum('campaignStatus', ['active', 'inactive']);

export const campaigns = pgTable('campaigns', {
	id: uuid('id').primaryKey(),
	name: text('text').notNull(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => user.id),
	status: campaignStatusEnum('campaignStatus').default('inactive'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const beaconPositions = pgTable('beaconPositions', {
	id: uuid('id').primaryKey(),
	beaconId: uuid('beacon_id')
		.notNull()
		.references(() => beacons.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	x: integer('x').notNull(),
	y: integer('y').notNull()
});

// export const campaignsRelationsWithUser = relations(campaigns, ({ one }) => {
// 	return {
// 		user: one(user, {
// 			fields: [campaigns.userId],
// 			references: [user.id]
// 		})
// 	};
// });

export const beaconsRelationsWithcampaignsToBeacons = relations(beacons, ({ one, many }) => ({
	position: one(beaconPositions, {
		fields: [beacons.id],
		references: [beaconPositions.beaconId]
	}),
	campaignsToBeacons: many(campaignsToBeacons)
}));

export const campaignsRelationsWithcampaignsToBeacons = relations(campaigns, ({ many }) => ({
	campaignsToBeacons: many(campaignsToBeacons)
}));

export const campaignsToBeaconsRelations = relations(campaignsToBeacons, ({ one }) => ({
	beacon: one(beacons, {
		fields: [campaignsToBeacons.beaconId],
		references: [beacons.id]
	}),
	campaign: one(campaigns, {
		fields: [campaignsToBeacons.campaignId],
		references: [campaigns.id]
	})
}));

export const customers = pgTable('customers', {
	id: uuid('id').primaryKey(),
	customerId: varchar('customer_id', { length: 15 }).notNull()
});

export const events = pgTable('events', {
	id: uuid('id').primaryKey(),
	status: text('status').notNull(),
	enterTimestamp: timestamp('enterTimestamp').notNull(),
	possibleExitTimestamp: timestamp('possibleExitTimestamp').notNull(),
	customerId: uuid('customer_id')
		.notNull()
		.references(() => customers.id),
	beaconId: uuid('beacon_id')
		.notNull()
		.references(() => beacons.id)
});

export type SelectCampaign = InferSelectModel<typeof campaigns>;
export type SelectBeacon = InferSelectModel<typeof beacons>;

// export type SelectBeaconWithPosition = {
// 	[beacons._.name]: typeof beacons.$inferSelect;
// 	position: {
// 		[beaconPositions._.name]: typeof beaconPositions.$inferSelect;
// 	};
// };

// export type SelectEvent = InferSelectModel<typeof events>;

export type SelectCampaignsWithBeacons = {
	// id: typeof campaigns.id.dataType;
	// name: typeof campaigns.name.dataType;
	// userId: typeof campaigns.userId.dataType;
	id: string;
	name: string;
	userId: string;
	createdAt: Date | null;
	status: string | null; //typeof campaignStatusEnum.enumValues
	campaignsToBeacons: {
		// beaconId:	string;
		// campaignId: string;
		beacon: typeof beacons.$inferSelect;
	}[];
};

// export type SelectCampaignsWIthBeacons = {
// 	[campaigns._.name]: typeof campaigns.$inferSelect;
// 	campaignsToBeacons: {
// 		beaconId: typeof campaignsToBeacons.beaconId;
// 		campaignId: typeof campaignsToBeacons.campaignId;
// 		beacon: typeof beacons.$inferSelect;
// 	}[];
// };

export type SelectEvents = {
	[events._.name]: typeof events.$inferSelect;
	// [customers._.name]: typeof customers.$inferSelect;
	[beacons._.name]: typeof beacons.$inferSelect;
};
