import { User } from '@/db/schema';
import { createParamDecorator, UnauthorizedException, ExecutionContext } from '@nestjs/common';

export interface CurrentUserOptions {
	required?: boolean;
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const user: User = request.user;
	return user;
});
export default CurrentUser;
