import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_KEY,
		});
	}

	async validate(user) {
		return user;
	}

	// async handleRequest(err, user, info) {
	// 	console.log(err, user);
	// 	if (err || !user) {
	// 		throw err || new UnauthorizedException();
	// 	}
	// 	return user;
	// }
}
