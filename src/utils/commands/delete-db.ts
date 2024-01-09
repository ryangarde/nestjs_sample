import { db } from '@/db/db-migrate';
import { sql } from 'drizzle-orm';

async function run() {
	const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

	const tables = await db.execute(query);

	for (let table of tables) {
		const query = sql.raw(`DROP TABLE ${table.table_name} CASCADE;`);
		await db.execute(query);
	}

	console.log('Database deleted successfully!');
	process.exit(0);
}

run();
