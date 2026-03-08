import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { HttpExceptionFilter, TransformInterceptor } from '@mancom/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AuthService');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3001);
  const host = configService.get<string>('host', '0.0.0.0');

  // Security: Use Helmet to set secure HTTP headers
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string | string[]>('cors.origins') || true,
    credentials: true,
  });

  await app.listen(port, host);

  logger.log(`Auth service running on http://${host}:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start auth service:', error);
  process.exit(1);
});
