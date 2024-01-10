import { Controller, Get, Post, Query, Request, Patch, Param } from '@nestjs/common';

import { posts } from '@/db/schema';
import { BaseService } from '@/app/base/base.service';
import { BaseController } from '@/app/base/base.controller';
import { apiResponse } from '@/utils/helpers/api-response';
import { UploadInterceptor } from '@/utils/decorators/upload-interceptor.decorator';
import { UseAuthGuard } from '@/utils/decorators/use-auth-guard.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerApi } from '@/utils/decorators/swagger-api';
import { db } from '@/db';

@UseAuthGuard()
@Controller('posts')
@ApiBearerAuth()
@ApiTags('Post')
export class PostsController extends BaseController {
	constructor() {
		super('posts', posts);
	}

	@SwaggerApi({ schema: posts, action: 'list' })
	@Get()
	async index(@Query() query) {
		// const baseService = new BaseService();
		// const posts = await baseService.index({ query, items: 'posts' });

		const postService = new BaseService('posts');
		const posts = await postService.index({ query });
		// const posts = await this.postService.index({ dbName: 'posts', query });
		return apiResponse({ data: posts });
	}

	// @ApiCreatedResponse({ type: CreatePostDTO, description: 'Successfully created' })
	@SwaggerApi({ schema: posts, action: 'create' })
	@Post()
	@UploadInterceptor([{ name: 'image' }])
	async create(@Request() req) {
		return super.create(req);
	}

	@SwaggerApi({ schema: posts, params: { name: 'id', required: true } })
	@Get(':id')
	async show(@Param('id') id) {
		return super.show<'posts'>(id, {
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
