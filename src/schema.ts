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
	doublePrecision,
	date,
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
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => user.id),
	address: varchar('address', { length: 100 }).notNull(),
	latitude: doublePrecision('latitude').notNull(),
	longitude: doublePrecision('longitude').notNull()
});

export const branchesRelations = relations(branches, ({ one }) => ({
	user: one(user, {
		fields: [branches.userId],
		references: [user.id]
	})
}));

export const floorplans = pgTable('floorplans', {
	id: uuid('id').primaryKey(),
	branchId: uuid('branch_id')
		.notNull()
		.references(() => branches.id, { onDelete: 'cascade' }),
	imgPath: text('img_path').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull()
});

export const floorplansRelations = relations(floorplans, ({ one, many }) => ({
	branch: one(branches, {
		fields: [floorplans.branchId],
		references: [branches.id]
	}),
	beaconsToFloorplans: many(beaconsToFloorplans)
}));

export const beacons = pgTable('beacons', {
	id: uuid('id').primaryKey(),
	branchId: uuid('branch_id')
		.notNull()
		.references(() => branches.id, { onDelete: 'cascade' }),
	proximityUUID: uuid('proximity_uuid').notNull(),
	major: integer('major').notNull(),
	minor: integer('minor').notNull(),
	radius: doublePrecision('radius').notNull(),
	name: varchar('name', { length: 40 })
});

export const beaconsRelations = relations(beacons, ({ one, many }) => ({
	branch: one(branches, {
		fields: [beacons.branchId],
		references: [branches.id]
	}),
	campaigns: many(campaignsToBeacons),
	floorplan: one(beaconsToFloorplans, {
		fields: [beacons.id],
		references: [beaconsToFloorplans.beaconId]
	})
}));

export const campaignStatusEnum = pgEnum('campaignStatus', ['active', 'inactive']);

export const campaigns = pgTable('campaigns', {
	id: uuid('id').primaryKey(),
	branchId: uuid('branch_id')
		.notNull()
		.references(() => branches.id, { onDelete: 'cascade' }),
	name: text('text').notNull(),
	status: campaignStatusEnum('campaign_status').default('inactive'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
	branch: one(branches, {
		fields: [campaigns.branchId],
		references: [branches.id]
	}),
	beacons: many(campaignsToBeacons)
}));

export const campaignsToBeacons = pgTable(
	'campaigns_to_beacons',
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

export const beaconsToFloorplans = pgTable(
	'beacons_to_floorplans',
	{
		beaconId: uuid('beacon_id')
			.notNull()
			.references(() => beacons.id, { onDelete: 'cascade' }),
		floorplanId: uuid('floorplan_id')
			.notNull()
			.references(() => floorplans.id, { onDelete: 'cascade' }),
		x: doublePrecision('x').notNull(),
		y: doublePrecision('y').notNull()
		// TODO  we should remove onDelete since it does not work with multiple priamry keys
		// refer to https://www.answeroverflow.com/m/1182472423266856970 and https://github.com/drizzle-team/drizzle-orm/pull/1636
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.beaconId, table.floorplanId] })
		};
	}
);

export const beaconsToFloorplansRelations = relations(beaconsToFloorplans, ({ one }) => ({
	beacon: one(beacons, {
		fields: [beaconsToFloorplans.beaconId],
		references: [beacons.id]
	}),
	floorplan: one(floorplans, {
		fields: [beaconsToFloorplans.floorplanId],
		references: [floorplans.id]
	})
}));

export const customers = pgTable('customers', {
	id: uuid('id').primaryKey(),
	customerId: varchar('customer_id', { length: 15 }).notNull()
});

export const events = pgTable('events', {
	id: uuid('id').primaryKey(),
	status: text('status').notNull(),
	enterTimestamp: timestamp('enter_timestamp').notNull(),
	possibleExitTimestamp: timestamp('possible_exit_timestamp').notNull(),
	customerId: uuid('customer_id')
		.notNull()
		.references(() => customers.id),
	beaconId: uuid('beacon_id')
		.notNull()
		.references(() => beacons.id),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id)
});

export const heatmaps = pgTable('heatmaps', {
	id: uuid('id').primaryKey(),
	floorplanId: text('floorplan_id')
		.notNull()
		.references(() => floorplans.id),
	date: date('date').notNull(),
	matrix: integer('matrix').array().array().notNull()
});

export type SelectBranch = InferSelectModel<typeof branches>;
export type SelectFloorplan = InferSelectModel<typeof floorplans>;
export type SelectCampaign = InferSelectModel<typeof campaigns>;
export type SelectBeacon = InferSelectModel<typeof beacons>;

export type SelectFloorplanWithBeacons = {
	id: string;
	branchId: string;
	img_path: string;
	width: number;
	height: number;
	beaconsToFloorplans: {
		beacon: typeof beacons.$inferSelect;
	}[];
};

export type SelectCampaignWithBeacons = {
	id: string;
	name: string;
	branchId: string;
	createdAt: Date | null;
	status: string | null;
	beacons: {
		beacon: {
			id: string;
			name: string | null;
			radius: number;
			floorplan: {
				x: number;
				y: number;
			};
		};
	}[];
};

export type SelectEvent = {
	[events._.name]: typeof events.$inferSelect;
	// [customers._.name]: typeof customers.$inferSelect;
	[beacons._.name]: typeof beacons.$inferSelect;
	[campaigns._.name]: typeof campaigns.$inferSelect;
};
