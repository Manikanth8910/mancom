# Auth Service

Authentication service for the Mancom platform.

## Overview

This service handles the hybrid authentication flow:

1. Users authenticate via Appwrite (OTP, email, OAuth)
2. Client exchanges Appwrite JWT for Mancom tokens via this service
3. Other services validate Mancom JWTs (no Appwrite dependency)

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/token | Public | Exchange Appwrite JWT for Mancom tokens |
| POST | /auth/refresh | Public | Refresh token pair |
| POST | /auth/logout | Public | Invalidate refresh token |
| GET | /auth/me | Required | Get current user info |
| GET | /health | Public | Health check |

## Configuration

See `.env.example` for required environment variables.

## Running Locally

```bash
# From repo root
make dev-auth

# Or directly
cd services/auth-service
pnpm dev
```

## Testing

```bash
pnpm test        # Run tests
pnpm test:cov    # With coverage
```

## Architecture

```
src/
├── auth/
│   ├── auth.controller.ts    # HTTP endpoints
│   ├── auth.service.ts       # Core auth logic
│   ├── appwrite.service.ts   # Appwrite integration
│   ├── token-store.service.ts # Redis token storage
│   └── dto/                  # Request/response DTOs
├── health/
│   └── health.controller.ts  # Health endpoint
├── config/
│   └── configuration.ts      # Config loading
├── app.module.ts             # Root module
└── main.ts                   # Bootstrap
```

See [Auth Flow Documentation](../../docs/architecture/auth-flow.md) for details.
