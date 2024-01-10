import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDTO {
	@ApiProperty({ required: true })
	name: string;

	@ApiProperty({ type: 'string', format: 'binary' })
	image: Date;

	@ApiProperty()
	description: string;

	@ApiProperty()
	is_active: string;
}
