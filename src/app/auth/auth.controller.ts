import { Body, Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import CurrentUser from '@/utils/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { db } from '@/db';
import { apiResponse } from '@/utils/helpers/api-response';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('login')
	async login(@Body() body) {
		try {
			const data = await this.authService.login(body);

			return apiResponse({ data, message: 'Successfully login' });
		} catch (err) {
			return apiResponse({ error: err });
		}
	}
	@Post('register')
	async register(@Body() body) {
		try {
			const data = await this.authService.register(body);

			return apiResponse({ data, message: 'Successfully registered' });
		} catch (err) {
			return apiResponse({ error: err });
		}
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	async getProfile(@CurrentUser() user) {
		try {
			const data = await db.query.users.findMany({
				with: {
					role: true,
				},
			});

			return apiResponse({ data });
		} catch (err) {
			return apiResponse({ error: err });
		}
	}
}
