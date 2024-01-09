import * as fs from 'fs';

async function run() {
	const filepath = 'src/db/seeders';

	for (let file of fs.readdirSync(filepath)) {
		console.log(`SEEDING FILE ${filepath}/${file}`);
		const run = require(`${filepath}/${file}`).default;
		await run();
	}

	console.log('Seeding complete!');

	process.exit(0);
}

run();
