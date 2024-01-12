import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDTO {
	@ApiProperty({ required: true })
	@IsNotEmpty()
	name: string;

	@ApiProperty({ type: 'string', format: 'binary' })
	image: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	is_active: string;

	@ApiProperty()
	created_datetime: string;
}
