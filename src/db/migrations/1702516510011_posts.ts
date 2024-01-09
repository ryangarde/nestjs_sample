import { relations } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, serial, boolean } from 'drizzle-orm/pg-core';
import { comments } from './1704286745049_comments';

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 256 }),
	image: varchar('image', { length: 256 }),
	description: text('description'),
	is_active: boolean('is_active').default(true),
	created_by: varchar('created_by', { length: 256 }),
	updated_by: varchar('updated_by', { length: 256 }),
	deleted_datetime: timestamp('deleted_datetime'),
	created_datetime: timestamp('created_datetime').defaultNow(),
	updated_datetime: timestamp('updated_datetime').defaultNow(),
});

export const postRelations = relations(posts, ({ many }) => ({
	comments: many(comments),
}));
