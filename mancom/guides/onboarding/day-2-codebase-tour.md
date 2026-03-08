# Day 2: Codebase Tour

Goal: Understand how the code is organized and how requests flow.

## Project Structure

```
mancom-backend/
├── packages/           # Shared code
│   ├── common/         # Guards, decorators, interfaces
│   └── jwt-utils/      # JWT utilities
├── services/           # Microservices
│   ├── auth-service/   # Authentication
│   └── visitor-service/# Visitor management (placeholder)
├── docs/               # Technical documentation
├── guides/             # These guides
└── scripts/            # Setup scripts
```

## Key Directories

### packages/common

Shared code used by all services:

```
common/
└── src/
    ├── decorators/     # @Public(), @Roles(), @CurrentUser()
    ├── guards/         # JwtAuthGuard, RolesGuard
    ├── filters/        # HttpExceptionFilter
    ├── interceptors/   # TransformInterceptor
    └── interfaces/     # JwtPayload, UserContext, ApiResponse
```

**Read these files:**
- `guards/jwt-auth.guard.ts` - How authentication works
- `interfaces/jwt-payload.interface.ts` - What's in a JWT

### packages/jwt-utils

JWT signing and verification:

```
jwt-utils/
└── src/
    ├── jwt.config.ts   # Configuration interface
    └── jwt.service.ts  # Sign and verify tokens
```

**Read:** `jwt.service.ts` - Token generation logic

### services/auth-service

The authentication service:

```
auth-service/
└── src/
    ├── auth/
    │   ├── auth.controller.ts   # HTTP endpoints
    │   ├── auth.service.ts      # Business logic
    │   ├── appwrite.service.ts  # Appwrite integration
    │   ├── token-store.service.ts # Redis token storage
    │   └── dto/                 # Request/response types
    ├── health/
    │   └── health.controller.ts
    ├── config/
    │   └── configuration.ts
    ├── app.module.ts            # Root module
    └── main.ts                  # Entry point
```

**Read these files:**
1. `main.ts` - How the app starts
2. `app.module.ts` - How modules are wired
3. `auth/auth.controller.ts` - Endpoint definitions
4. `auth/auth.service.ts` - Core logic

## How Authentication Works

```
┌─────────┐     ┌─────────┐     ┌─────────────┐
│ Client  │     │ Appwrite│     │Auth Service │
└────┬────┘     └────┬────┘     └──────┬──────┘
     │               │                 │
     │ 1. Login      │                 │
     │──────────────>│                 │
     │ Appwrite JWT  │                 │
     │<──────────────│                 │
     │               │                 │
     │ 2. POST /auth/token             │
     │────────────────────────────────>│
     │               │                 │
     │               │ 3. Verify       │
     │               │<────────────────│
     │               │ User data       │
     │               │────────────────>│
     │               │                 │
     │ 4. Mancom tokens                │
     │<────────────────────────────────│
```

1. User logs in via Appwrite (mobile/web)
2. Client sends Appwrite JWT to our auth service
3. Auth service verifies with Appwrite
4. Auth service returns our custom JWT pair

## Request Flow

When a request hits an endpoint:

```
Request
   │
   ▼
┌──────────────────┐
│ HttpExceptionFilter │  ← Catches errors
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ TransformInterceptor │  ← Wraps responses
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ JwtAuthGuard     │  ← Validates token
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ RolesGuard       │  ← Checks roles (if @Roles used)
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ ValidationPipe   │  ← Validates DTO
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ Controller       │  ← Handles request
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ Service          │  ← Business logic
└──────────────────┘
```

## Exercise: Trace a Request

Open `auth/auth.controller.ts` and trace what happens for `POST /auth/token`:

1. What guard runs? (Hint: check for `@Public()`)
2. What DTO validates the request?
3. What service method is called?
4. How does that service verify the Appwrite JWT?
5. How is the response formatted?

Write down your answers. Discuss with your mentor.

## Key Concepts

### Modules

NestJS apps are organized into modules. Each module has:
- Controllers (handle HTTP)
- Services (business logic)
- Providers (dependencies)

### Dependency Injection

Services are injected via constructor:

```typescript
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // authService is automatically injected
}
```

### Decorators

Custom decorators add behavior:

```typescript
@Public()           // Skip auth
@Roles('admin')     // Require role
@CurrentUser()      // Get user from request
```

## Checkpoint

By end of Day 2, you should understand:

- [ ] Project folder structure
- [ ] How auth flow works
- [ ] How a request flows through the app
- [ ] What guards, filters, interceptors do
- [ ] Where business logic lives (services)

## Next

Continue to [Day 3: First Task](day-3-first-task.md).
