import * as fs from 'fs';
import * as path from 'path';

function createMigrationFile(name) {
	const timestamp = Date.now();
	const fileName = `${timestamp}_${name}.ts`;
	const filePath = path.join('src', 'db', 'seeders', fileName);

	const content = `
import { db } from '@/db/db-migrate';

async function run() {

}

export default run;
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
