import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_KEY,
			signOptions: { expiresIn: '8h' },
		}),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy, UsersService],
	exports: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
