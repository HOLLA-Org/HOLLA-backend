import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const HOST = configService.get<string>('HOST', 'localhost');
  const PORT = configService.get<string>('PORT', '8080');

  await app.listen(PORT, () => {
    console.log(`App running at http://${HOST}:${PORT}`);
  });
}

bootstrap();
