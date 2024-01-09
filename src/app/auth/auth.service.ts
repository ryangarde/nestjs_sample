import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db } from '@/db';
import { User } from '@/db/schema';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CustomException } from '@/utils/helpers/api-response';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UsersService
	) {}

	async validateUser(username: string, pass: string) {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, username),
		});

		if (!user) {
			throw new CustomException('User not found', 404);
		}

		const validPassword = await bcrypt.compare(pass, user.password);

		if (!validPassword) {
			throw new CustomException('Invalid password', 404);
		}

		if (user && validPassword) {
			const { password, ...result } = user;
			return result;
		}

		return null;
	}

	async login(payload: Pick<User, 'email' | 'password' | 'username'>) {
		const user = await this.validateUser(payload.email, payload.password);

		const accessToken = this.jwtService.sign(user, {
			expiresIn: '8h',
			secret: process.env.JWT_KEY,
		});

		return {
			user,
			access_token: accessToken,
		};
	}

	async register(payload: Omit<User, 'id' | 'created_datetime' | 'updated_datetime'>) {
		const user = await this.userService.create(payload);

		const accessToken = this.jwtService.sign(user, {
			expiresIn: '8h',
			secret: process.env.JWT_KEY,
		});

		return {
			user,
			access_token: accessToken,
		};
	}
}
