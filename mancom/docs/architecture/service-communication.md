# Service Communication

## Overview

Services communicate via HTTP REST APIs. Each service is independent and validates JWTs locally.

## Communication Patterns

### Client → Service

All client requests go through services directly (future: API gateway).

```
Client ──HTTP──> Service
        │
        └── Authorization: Bearer <accessToken>
```

### Service → Service

For internal calls, services pass the user's token:

```
Service A ──HTTP──> Service B
           │
           └── Authorization: Bearer <accessToken>
                X-Request-ID: <traceId>
```

## Request Headers

### Required Headers

| Header | Description |
|--------|-------------|
| `Authorization` | Bearer token for authenticated endpoints |
| `Content-Type` | `application/json` for request bodies |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Trace ID for request correlation |
| `X-Forwarded-For` | Client IP (set by gateway/proxy) |

## Error Propagation

When Service A calls Service B and B returns an error:

1. **Client errors (4xx)**: Propagate as-is to the original caller
2. **Server errors (5xx)**: Log details, return generic error to caller

```typescript
// Service A calling Service B
try {
  const response = await this.httpService.get(serviceBUrl);
  return response.data;
} catch (error) {
  if (error.response?.status < 500) {
    // Propagate client error
    throw new HttpException(error.response.data, error.response.status);
  }
  // Log and wrap server error
  this.logger.error('Service B error', error);
  throw new InternalServerErrorException({
    code: 'DOWNSTREAM_ERROR',
    message: 'An internal service error occurred',
  });
}
```

## Service Discovery

Currently: Services use environment variables for URLs.

```env
AUTH_SERVICE_URL=http://localhost:3001
VISITOR_SERVICE_URL=http://localhost:3002
```

Future: Service mesh or container orchestration.

## Timeouts and Retries

### Timeouts

| Call Type | Timeout |
|-----------|---------|
| API to Service | 30 seconds |
| Service to Service | 10 seconds |
| Database query | 5 seconds |

### Retry Policy

Only retry on:
- Network errors (connection refused, timeout)
- 503 Service Unavailable

Do not retry on:
- 4xx errors (client's fault)
- 500, 502 errors (likely persistent)

## Circuit Breaker

For production, implement circuit breaker pattern:

1. **Closed**: Normal operation
2. **Open**: Fail fast after threshold failures
3. **Half-Open**: Test with single request

## Request Tracing

Pass `X-Request-ID` through all service calls:

```typescript
// Generate or forward request ID
const requestId = req.headers['x-request-id'] || uuid();

// Include in logs
this.logger.log({ requestId, action: 'processing request' });

// Forward to downstream services
await this.httpService.get(url, {
  headers: { 'X-Request-ID': requestId },
});
```

## API Versioning

Current approach: No versioning (v1 implied).

Future: URL prefix versioning if needed.

```
/api/v1/visitors
/api/v2/visitors
```
