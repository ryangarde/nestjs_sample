import { db } from '@/db';
import { User, users } from '@/db/schema';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	async create(payload: Partial<User>) {
		const password = await bcrypt.hash(payload.password, 10);

		const user = (
			await db
				.insert(users)
				.values({
					...payload,
					password,
				})
				.returning()
		)[0];

		return user;
	}
}
