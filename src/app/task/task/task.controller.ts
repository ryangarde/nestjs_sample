import { JwtAuthGuard } from '@/app/auth/jwt-auth.guard';
import { db } from '@/db';
import { User, tasks } from '@/db/schema';
import { UseAuthGuard } from '@/utils/decorators/use-auth-guard.decorator';
import CurrentUser from '@/utils/decorators/user.decorator';
import { Body, Controller, Get, Query, Request, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { like, sql } from 'drizzle-orm';

@UseAuthGuard()
@Controller('task')
export class TaskController {
	@Get()
	async index(@Query() query, @CurrentUser() user) {
		const tasksTb = await db.query.tasks.findMany({
			where: (tasks, { between, and, eq, or }) =>
				and(
					between(tasks.created_datetime, new Date(), new Date()),
					or(eq(tasks.description, query.name), like(tasks.name, '%' + query.name))
				),
			// where:(tasks, {eq, and, like}) => and(eq(tasks.is_active, true), eq(tasks.created_datetime, new Date())),
		});

		const tasks2 = await db
			.select({
				name: sql`${tasks.name}`.as('user_name'),
				// name: true
			})
			.from(tasks)
			.limit(1);

		return { tasksTb, tasks2: tasks2[0] };
	}
}

// /api/task/dashboard
