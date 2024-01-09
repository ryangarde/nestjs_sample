import { User } from '@/db/schema';
import { createParamDecorator, UnauthorizedException, ExecutionContext } from '@nestjs/common';

export interface CurrentUserOptions {
	required?: boolean;
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	console.log(ctx.getClass());
	return request.user as User;
});
export default CurrentUser;
