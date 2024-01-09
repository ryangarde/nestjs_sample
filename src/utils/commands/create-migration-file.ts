import * as fs from 'fs';
import * as path from 'path';

function createMigrationFile(name) {
	const timestamp = Date.now();
	const fileName = `${timestamp}_${name}.ts`;
	const filePath = path.join('src', 'db', 'migrations', fileName);

	const content = `
import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const ${name} = pgTable('${name}', {
	id: serial('id').primaryKey(),

	is_active: boolean('is_active').default(true),
	created_by: varchar('created_by', { length: 256 }),
	updated_by: varchar('updated_by', { length: 256 }),
	deleted_datetime: timestamp('deleted_datetime'),
	created_datetime: timestamp('created_datetime').defaultNow(),
	updated_datetime: timestamp('updated_datetime').defaultNow(),
});
  `;

	fs.writeFileSync(filePath, content);

	console.log('Migration file created successfully!');
}

const args = process.argv.slice(2);
const nameIndex = args.findIndex((arg) => arg.startsWith('--name'));

if (nameIndex !== -1 && nameIndex + 1 < args.length) {
	const name = args[nameIndex + 1];
	createMigrationFile(name);
} else {
	console.error('Please provide a name for the migration using --name your_migration_name.');
	process.exit(1);
}
