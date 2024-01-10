import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
	id: serial('id').primaryKey(),
	created_datetime: timestamp('created_datetime').defaultNow(),
	name: varchar('name', { length: 256 }),
	description: varchar('description', { length: 256 }),
	address: varchar('address', { length: 256 }),
	is_active: boolean('is_active').default(true),
	created_by: varchar('created_by', { length: 256 }),
	updated_by: varchar('updated_by', { length: 256 }),
	deleted_datetime: timestamp('deleted_datetime'),
	updated_datetime: timestamp('updated_datetime').defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
