import { pgTable, serial, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core';
import { posts } from '../schema';
import { relations } from 'drizzle-orm';

export const comments = pgTable('comments', {
	id: serial('id').primaryKey(),
	description: text('description'),
	post_id: serial('post_id').references(() => posts.id),
	is_active: boolean('is_active').default(true),
	created_by: varchar('created_by', { length: 256 }),
	updated_by: varchar('updated_by', { length: 256 }),
	deleted_datetime: timestamp('deleted_datetime'),
	created_datetime: timestamp('created_datetime').defaultNow(),
	updated_datetime: timestamp('updated_datetime').defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
	post: one(posts, {
		fields: [comments.post_id],
		references: [posts.id],
	}),
}));
