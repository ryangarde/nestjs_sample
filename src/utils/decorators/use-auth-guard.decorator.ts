import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/app/auth/jwt-auth.guard';

export const UseAuthGuard = () => {
	return applyDecorators(UseGuards(JwtAuthGuard));
};
