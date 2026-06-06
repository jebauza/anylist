import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

// Set TEST_VERBOSE='true' to see NestJS logs during e2e tests
export function createTestApp(moduleFixture: TestingModule): INestApplication {
  const app = moduleFixture.createNestApplication({
    logger: process.env.TEST_VERBOSE === 'true' ? undefined : false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  return app;
}
