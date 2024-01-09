import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { fileOptions } from '../common/file';
import { applyDecorators, UseInterceptors } from '@nestjs/common';

export const UploadInterceptor = (uploadFields: MulterField[] | string) => {
	return applyDecorators(
		UseInterceptors(
			typeof uploadFields === 'string' ? FileInterceptor(uploadFields, fileOptions) : FileFieldsInterceptor(uploadFields, fileOptions)
		)
	);
};
