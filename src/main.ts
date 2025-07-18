import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const HOST = configService.get<string>('HOST', 'localhost');
  const PORT = configService.get<string>('PORT', '8080');

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('HoLLa API')
    .setDescription('API documentation for HoLLa project')
    .setVersion('1.0')
    .addBearerAuth() // Optional: for JWT auth support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // http://localhost:PORT/api-docs

  await app.listen(PORT, () => {
    console.log(`App running at http://${HOST}:${PORT}`);
    console.log(`Swagger Docs available at http://${HOST}:${PORT}/api-docs`);
  });
}

bootstrap();
