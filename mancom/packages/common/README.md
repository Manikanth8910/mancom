# @mancom/common

Shared utilities, guards, decorators, and interfaces for Mancom services.

## Installation

This package is internal to the monorepo. Add it as a dependency:

```json
{
  "dependencies": {
    "@mancom/common": "workspace:*"
  }
}
```

## Contents

### Decorators

- `@Public()` - Marks a route as public (no authentication required)
- `@Roles(...roles)` - Specifies required roles for a route
- `@CurrentUser()` - Extracts user context from request

### Guards

- `JwtAuthGuard` - Validates JWT tokens on protected routes
- `RolesGuard` - Enforces role-based access control

### Filters

- `HttpExceptionFilter` - Transforms exceptions into standard error responses

### Interceptors

- `TransformInterceptor` - Wraps responses in standard success format

### Interfaces

- `JwtPayload` - JWT token payload structure
- `UserContext` - Authenticated user context
- `ApiResponse` - Standard success response
- `ApiErrorResponse` - Standard error response
- `PaginatedResponse` - Paginated list response

## Usage

```typescript
import {
  JwtAuthGuard,
  RolesGuard,
  Public,
  Roles,
  CurrentUser,
  UserContext,
} from '@mancom/common';

@Controller('visitors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitorController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Roles('resident', 'security')
  @Get()
  list(@CurrentUser() user: UserContext) {
    return this.visitorService.findBySociety(user.societyId);
  }
}
```

## Setting Up Guards

Services must provide a JWT verifier implementation:

```typescript
import { Module } from '@nestjs/common';
import { JwtAuthGuard, JWT_VERIFIER } from '@mancom/common';
import { JwtService } from '@mancom/jwt-utils';

@Module({
  providers: [
    JwtService,
    {
      provide: JWT_VERIFIER,
      useExisting: JwtService,
    },
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
```
