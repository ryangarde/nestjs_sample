import { db } from '@/db';
import { User, users } from '@/db/schema';
import OptionalExcept from '@/types/optional-except';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	async create(payload: OptionalExcept<User, 'first_name' | 'last_name' | 'email' | 'password' | 'username'>) {
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
