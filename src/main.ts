import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // transforms payloads to DTOs
      transformOptions: {
        enableImplicitConversion: true, // enables automatic type conversion
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
