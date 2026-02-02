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
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('HoLLa API')
    .setDescription('API documentation for HoLLa project')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication User', 'Authentication related endpoints')
    .addTag('Authentication Admin', 'Authentication related endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Hotels', 'Hotel management endpoints')
    .addTag('Bookings', 'Booking management endpoints')
    .addTag('Payments', 'Payment management endpoints')
    .addTag('Discounts', 'Discount management endpoints')
    .addTag('Reviews', 'Review management endpoints')
    .addTag('Profile', 'Profile management endpoints')
    .addTag('Notification', 'Notification management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  }); // http://localhost:PORT/api-docs

  // Dev
  /*
  await app.listen(PORT, () => {
    console.log(`App running at http://${HOST}:${PORT}`);
    console.log(`Swagger Docs available at http://${HOST}:${PORT}/api-docs`);
  });
  */

  // Prod
  const port = process.env.PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 PROD running on port ${port}`);
}

bootstrap();
