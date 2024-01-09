import { db } from '@/db/db-migrate';
import { roles, users } from '../schema';
import * as bcrypt from 'bcrypt';

async function run() {
	await db.insert(roles).values({ name: 'Admin', created_by: 'seeder', updated_by: 'seeder' });
	const role = (await db.insert(roles).values({ name: 'User', created_by: 'seeder', updated_by: 'seeder' }).returning())?.[0];

	const password = await bcrypt.hash('123456', 10);

	await db.insert(users).values({
		username: 'ryan',
		first_name: 'ryan',
		last_name: 'garde',
		email: 'ryangarde12@gmail.com',
		password,
		role_id: role.id,
		created_by: 'seeder',
		updated_by: 'seeder',
	});
}

export default run;
