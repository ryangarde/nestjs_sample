import { bigint, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { roles } from './1702516510010_roles';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	first_name: varchar('first_name', { length: 256 }).notNull(),
	last_name: varchar('last_name', { length: 256 }).notNull(),
	middle_name: varchar('middle_name', { length: 256 }),
	suffix: varchar('suffix', { length: 256 }),
	email: varchar('email', { length: 256 }).unique().notNull(),
	username: varchar('username', { length: 256 }).unique().notNull(),
	password: varchar('password', { length: 256 }),
	role_id: bigint('role_id', { mode: 'number' }).references(() => roles.id),
	created_by: varchar('created_by', { length: 256 }),
	updated_by: varchar('updated_by', { length: 256 }),
	created_datetime: timestamp('created_datetime').defaultNow(),
	updated_datetime: timestamp('updated_datetime').defaultNow(),
});

export const userRelations = relations(users, ({ one }) => ({
	role: one(roles, {
		fields: [users.role_id],
		references: [roles.id],
	}),
}));

export type User = typeof users.$inferSelect;
