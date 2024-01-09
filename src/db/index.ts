import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import * as postgres from 'postgres';

export const connection = postgres({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

export const db = drizzle(connection, { schema });
