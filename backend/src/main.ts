import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { AppConfig } from './app.config.provider';
import { ApiExceptionFilter } from './api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  app.useGlobalFilters(new ApiExceptionFilter());
  const config = app.get<AppConfig>('CONFIG');
  await app.listen(config.port);
}
bootstrap();
