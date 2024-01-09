import fs from 'fs';

const lines = [];

function recursiveRouteScan(filepath) {
	fs.readdirSync(filepath).forEach((file) => {
		if (fs.lstatSync(filepath + `/` + file).isDirectory()) {
			console.log(`PERFORMING SCAN IN ${filepath}/${file}`);
			recursiveRouteScan(filepath + `/` + file);
		} else {
			console.log(`MIGRATING FILE ${filepath}/${file}`);
			lines.push(`export * from '${`./migrations/` + file.replace('.ts', '')}';`);
		}
	});
}

recursiveRouteScan('src/db/migrations');

fs.writeFileSync('src/db/schema.ts', lines.join('\n'));
