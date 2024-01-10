import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaintenanceModule } from './app/maintenance/maintenance.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path, { join } from 'path';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './app/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { BaseService } from './app/base/base.service';
import { diskStorage } from 'multer';
import { TaskModule } from './app/task/task.module';
import * as fs from 'fs';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '.', 'public'),
			exclude: ['/api*'],
		}),
		MulterModule.register({
			dest: '../public/uploads',
			// storage: diskStorage({
			// 	destination: function (req, file, cb) {
			// 		let path = `./public/uploads/`;
			// 		fs.mkdirSync(path, { recursive: true });
			// 		cb(null, path);
			// 	},
			// 	filename: function (req, file, cb) {
			// 		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			// 		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
			// 	},
			// }),
		}),
		MaintenanceModule,
		RouterModule.register([
			{
				path: 'maintenance',
				module: MaintenanceModule,
			},
		]),
		AuthModule,
		TaskModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
