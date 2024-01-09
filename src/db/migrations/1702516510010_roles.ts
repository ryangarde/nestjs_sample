import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 256 }),
	created_by: varchar('created_by', { length: 256 }),
	updated_by: varchar('updated_by', { length: 256 }),
	created_datetime: timestamp('created_datetime').defaultNow(),
	updated_datetime: timestamp('updated_datetime').defaultNow(),
});
