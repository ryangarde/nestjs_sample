import { Module } from '@nestjs/common';
import { PostsController } from './posts/posts.controller';
import { BaseService } from '../base/base.service';

@Module({
	controllers: [PostsController],
	providers: [BaseService],
})
export class MaintenanceModule {}
