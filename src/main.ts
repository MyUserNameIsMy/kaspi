import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ResponseTimeMiddleware } from './common/middlewares/response-time.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(ResponseTimeMiddleware);
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Kaspi Parser')
    .setVersion('1.0')
    .addTag('KASPI')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(3010);
}
bootstrap();
