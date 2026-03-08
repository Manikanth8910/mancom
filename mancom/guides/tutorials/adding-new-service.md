# Adding a New Service

Step-by-step guide to add a new microservice.

## 1. Create Service Directory

```bash
mkdir -p services/my-service/src
cd services/my-service
```

## 2. Create package.json

```json
{
  "name": "@mancom/my-service",
  "version": "0.1.0",
  "description": "My service description",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "clean": "rm -rf dist",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@mancom/common": "workspace:*",
    "@mancom/jwt-utils": "workspace:*",
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.11.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
```

## 3. Create Configuration Files

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}
```

### jest.config.js

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### .env.example

```env
PORT=3003
HOST=0.0.0.0
JWT_PUBLIC_KEY_PATH=../../keys/public.pem
```

## 4. Create Source Files

### src/config/configuration.ts

```typescript
export default () => ({
  port: parseInt(process.env.PORT || '3003', 10),
  host: process.env.HOST || '0.0.0.0',
  jwt: {
    publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem',
  },
});
```

### src/health/health.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '@mancom/common';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'my-service',
      timestamp: new Date().toISOString(),
    };
  }
}
```

### src/health/health.module.ts

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

### src/app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, JWT_VERIFIER } from '@mancom/common';

import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { JwtVerifierService } from './jwt-verifier.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
    // Add your feature modules here
  ],
  providers: [
    JwtVerifierService,
    {
      provide: JWT_VERIFIER,
      useExisting: JwtVerifierService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

### src/jwt-verifier.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtVerifier } from '@mancom/common';
import { JwtService } from '@mancom/jwt-utils';

@Injectable()
export class JwtVerifierService implements JwtVerifier {
  private readonly jwtService: JwtService;

  constructor(private readonly configService: ConfigService) {
    this.jwtService = new JwtService({
      privateKeyPath: '', // Not needed for verification
      publicKeyPath: this.configService.get('jwt.publicKeyPath'),
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAccessToken(token);
  }
}
```

### src/main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, TransformInterceptor } from '@mancom/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('MyService');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3003);
  const host = configService.get<string>('host', '0.0.0.0');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors({ origin: true, credentials: true });

  await app.listen(port, host);
  logger.log(`My service running on http://${host}:${port}`);
}

bootstrap();
```

## 5. Add to Docker Compose (Optional)

In `docker/docker-compose.yml`, add if service needs external dependencies.

## 6. Add to Makefile

```makefile
dev-myservice: ## Start my-service
	pnpm dev:myservice
```

In root `package.json`:

```json
"scripts": {
  "dev:myservice": "turbo run dev --filter=@mancom/my-service"
}
```

## 7. Create README

```markdown
# My Service

Brief description.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Health check |

## Configuration

See `.env.example`.

## Running

\`\`\`bash
make dev-myservice
\`\`\`
```

## 8. Install and Build

```bash
# From repo root
pnpm install
pnpm build
```

## 9. Test It

```bash
make dev-myservice
curl http://localhost:3003/health
```

## Checklist

- [ ] package.json created
- [ ] tsconfig.json created
- [ ] Configuration module set up
- [ ] Health endpoint works
- [ ] JWT verification configured
- [ ] Added to Makefile
- [ ] README written
- [ ] Builds successfully
