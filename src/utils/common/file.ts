import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const fileOptions: MulterOptions = {
	storage: diskStorage({
		destination: function (req, file, cb) {
			let path = 'public/uploads/';
			fs.mkdirSync(path, { recursive: true });
			cb(null, path);
		},
		filename: function (req, file, cb) {
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
		},
	}),
};
