import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDTO {
	@ApiProperty()
	name: string;

	@ApiProperty({ type: 'string', format: 'binary' })
	image: Date;
}
