import { count } from 'drizzle-orm';
import { double } from 'drizzle-orm/mysql-core';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
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
	visitedAt: integer('visited_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

export type UserVisitedArea = typeof userVisitedArea.$inferSelect;
export type Seed = typeof seed.$inferSelect;
export type Ritual = typeof ritual.$inferSelect;
export type Area = typeof area.$inferSelect;
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
