# Debugging Guide

## Logging

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Unexpected failures, exceptions |
| `warn` | Recoverable issues, deprecations |
| `log` | Important events (default) |
| `debug` | Detailed debugging info |
| `verbose` | Very detailed tracing |

### Setting Log Level

```env
# .env
LOG_LEVEL=debug
```

### Logging in Code

```typescript
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething(id: string) {
    this.logger.debug(`Processing item ${id}`);

    try {
      // ... operation
      this.logger.log(`Completed processing ${id}`);
    } catch (error) {
      this.logger.error(`Failed to process ${id}`, error.stack);
      throw error;
    }
  }
}
```

## VS Code Debugging

### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "args": ["${workspaceFolder}/services/auth-service/src/main.ts"],
      "cwd": "${workspaceFolder}/services/auth-service",
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/services/auth-service/.env",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Current Test",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "args": [
        "${workspaceFolder}/node_modules/jest/bin/jest.js",
        "--runInBand",
        "--no-cache",
        "${relativeFile}"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### Using Breakpoints

1. Click in the gutter to set a breakpoint
2. Press F5 to start debugging
3. Use Debug Console to inspect variables

## Common Debugging Scenarios

### JWT Verification Failures

```typescript
// Add debug logging
this.logger.debug('Token payload:', JSON.stringify(payload));
this.logger.debug('Expected issuer:', this.config.issuer);
this.logger.debug('Token issuer:', payload.iss);
```

Check:
- Token not expired (`exp` > current time)
- Correct issuer and audience
- Public key matches private key that signed token

### Request Not Reaching Controller

1. Check if route is registered:

```bash
# NestJS logs registered routes on startup
[Nest] Routes registered: ...
```

2. Check middleware order (guards run before controllers)

3. Add logging to guard:

```typescript
async canActivate(context: ExecutionContext) {
  this.logger.debug('Guard executing');
  // ...
}
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection from container
docker exec -it mancom-postgres psql -U mancom -d mancom -c 'SELECT 1'

# Check connection string
echo $DATABASE_URL
```

### Redis Connection Issues

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
docker exec -it mancom-redis redis-cli ping
# Should return: PONG
```

## Inspecting Network Requests

### Using curl

```bash
# Test endpoint
curl -v http://localhost:3001/health

# With auth header
curl -v -H "Authorization: Bearer <token>" http://localhost:3001/auth/me

# POST with body
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{"appwriteJwt":"..."}' \
  http://localhost:3001/auth/token
```

### Using VS Code REST Client

Create `requests.http`:

```http
### Health check
GET http://localhost:3001/health

### Exchange token
POST http://localhost:3001/auth/token
Content-Type: application/json

{
  "appwriteJwt": "..."
}

### Get current user
GET http://localhost:3001/auth/me
Authorization: Bearer {{accessToken}}
```

## Performance Debugging

### Slow Requests

Add timing logs:

```typescript
async handleRequest() {
  const start = Date.now();

  const result = await this.service.process();

  this.logger.debug(`Request took ${Date.now() - start}ms`);
  return result;
}
```

### Memory Issues

```bash
# Run with memory profiling
node --inspect --max-old-space-size=4096 dist/main.js

# Connect Chrome DevTools
# Open chrome://inspect
```

## Useful Commands

```bash
# Watch logs in real-time
make docker-logs

# Check service memory
docker stats mancom-postgres mancom-redis

# View recent errors
docker logs mancom-postgres --tail 50
```
