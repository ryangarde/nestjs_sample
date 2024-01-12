import { Controller, Get, Post, Query, Request, Patch, Param, Body } from '@nestjs/common';

import { posts, Post as PostModel } from '@/db/schema';
import { BaseService } from '@/app/base/base.service';
import { BaseController } from '@/app/base/base.controller';
import { apiResponse } from '@/utils/helpers/api-response';
import { UploadInterceptor } from '@/utils/decorators/upload-interceptor.decorator';
import { UseAuthGuard } from '@/utils/decorators/use-auth-guard.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerApi } from '@/utils/decorators/swagger-api';
import { db } from '@/db';
import { CreatePostDTO } from './create-post.dto';
import { isNull } from 'drizzle-orm';

@UseAuthGuard()
@ApiBearerAuth()
@ApiTags('Post')
@Controller('posts')
export class PostsController extends BaseController {
	constructor(private baseService: BaseService) {
		super({
			dbName: 'posts',
			schema: posts,
		});
	}

	@SwaggerApi({ schema: posts, action: 'list' })
	@Get()
	async index(@Request() req, @Body() body) {
		// const baseService = new BaseService();
		// const posts = await baseService.index({ query, items: 'posts' });

		const postService = new BaseService();

		const postsList = await postService.index<PostModel, 'posts'>({
			dbName: 'posts',
			req,
			schema: posts,
			query: {
				// where: (posts, { isNull, and }) => and(isNull(posts.deleted_datetime)),
				where: isNull(posts.deleted_datetime),
			},
		});

		// const posts = await this.baseService.index({ query, dbName: 'posts' });
		return apiResponse({ data: postsList });
	}

	// @ApiCreatedResponse({ type: CreatePostDTO, description: 'Successfully created' })
	@SwaggerApi({ schema: posts, action: 'create', body: { type: CreatePostDTO } })
	@Post()
	@UploadInterceptor([{ name: 'image' }])
	async create(@Request() req, @Body() body: CreatePostDTO) {
		console.log(body);
		return 'success';
		// return super.create(req);
	}

	@SwaggerApi({ schema: posts, params: { name: 'id', required: true } })
	@Get(':id')
	async show(@Request() req) {
		return super.show<'posts'>(req, {
			where: (posts, { eq }) => eq(posts.is_active, true),
			with: {
				comments: true,
			},
		});
		// try {
		// 	const postService = new BaseService('posts');

		// 	const post = await postService.show<'posts'>(id, {
		// 		where: (posts, { eq, and }) => and(eq(posts.is_active, true)),
		// 		with: {
		// 			comments: true,
		// 		},
		// 	});
		// 	return apiResponse({ data: post });
		// } catch (err) {
		// 	console.log(err);
		// 	return apiResponse({ error: err });
		// }
	}

	@SwaggerApi({ schema: posts, action: 'update' })
	@Patch(':id')
	@UploadInterceptor('image')
	async update(@Param('id') id, @Request() req) {
		return super.update(id, req);
	}
}
