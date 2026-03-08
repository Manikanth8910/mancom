import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, TransformInterceptor } from '@mancom/common';

import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('VisitorService');
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('port', 3002);
    const host = configService.get<string>('host', '0.0.0.0');

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    app.enableCors({ origin: true, credentials: true });

    await app.listen(port, host);
    logger.log(`Visitor service running on http://${host}:${port}`);
}

bootstrap();
