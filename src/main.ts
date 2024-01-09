import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule);

	const config = new DocumentBuilder().setTitle('My Title').setDescription('Sample Description').addBearerAuth().build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	app.setGlobalPrefix('api');
	await app.listen(3000);
}
bootstrap();
