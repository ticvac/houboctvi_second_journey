import { count } from 'drizzle-orm';
import { double } from 'drizzle-orm/mysql-core';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	seedsCollected: integer('seeds_collected').default(0),
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const area = sqliteTable('area', {
	id: text('id').primaryKey(),
	lat: real('lat').notNull(),
	lon: real('lon').notNull(),
});

export const ritual = sqliteTable('ritual', {
	id: text('id').primaryKey(),
	areaId: text('area_id').notNull().references(() => area.id),
	lat: real('lat').notNull(),
	lon: real('lon').notNull(),
});

export const seed = sqliteTable('seed', {
	id: text('id').primaryKey(),
	areaId: text('area_id').notNull().references(() => area.id),
	count: integer('count').default(1),
	lat: real('lat').notNull(),
	lon: real('lon').notNull(),
});

export const userVisitedArea = sqliteTable('user_visited_area', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	areaId: text('area_id').notNull().references(() => area.id),
	visitedAt: integer('visited_at', { mode: 'timestamp' }).notNull()
	.default(sql`(strftime('%s','now'))`),
});

export const userVisibleRituals = sqliteTable('user_visible_rituals', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	ritualId: text('ritual_id').notNull().references(() => ritual.id),
	visibleAt: integer('visible_at', { mode: 'timestamp' }).notNull()
	.default(sql`(strftime('%s','now'))`),
});

export const mushroom = sqliteTable('mushroom', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	file_name: text('file_name').notNull(),
	unsanity: text('unsanity').notNull(),
	tastyfulness: text('tastyfulness').notNull(),
	rarity: text('rarity').notNull(),
	almanach: text('info').notNull(),
});

export const userMushroomCount = sqliteTable('user_mushroom_count', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	mushroomId: text('mushroom_id').notNull().references(() => mushroom.id),
	count: integer('count').default(1),
});

export const userAlmanachAccess = sqliteTable('user_almanach_access', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	mushroomId: text('mushroom_id').notNull().references(() => mushroom.id),
});

export const locationEntry = sqliteTable('location_entry', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	time: integer('time', { mode: 'timestamp' }).notNull()
	.default(sql`(strftime('%s','now'))`),
	lat: real('lat').notNull(),
	lon: real('lon').notNull(),
});


export type LocationEntry = typeof locationEntry.$inferSelect;
export type UserAlmanachAccess = typeof userAlmanachAccess.$inferSelect;
export type UserMushroomCount = typeof userMushroomCount.$inferSelect;
export type Mushroom = typeof mushroom.$inferSelect;
export type UserVisibleRituals = typeof userVisibleRituals.$inferSelect;
export type UserVisitedArea = typeof userVisitedArea.$inferSelect;
export type Seed = typeof seed.$inferSelect;
export type Ritual = typeof ritual.$inferSelect;
export type Area = typeof area.$inferSelect;
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
