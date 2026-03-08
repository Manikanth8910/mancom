# Mancom Backend

Production-ready backend monorepo for **Mancom** - a residential society management platform.

## Overview

Mancom helps residential societies manage:
- Visitor pre-registration and approval
- Society and flat management
- Maintenance requests
- Billing and payments
- Notifications

### Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20+ |
| Framework | NestJS 10+ |
| Language | TypeScript 5+ |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth Provider | Appwrite |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Jest |

### Architecture Highlights

- **Microservices**: Each domain has its own service
- **Hybrid Auth**: Appwrite handles login, we issue our own JWTs
- **Shared Packages**: Common code in `packages/` for consistency
- **RS256 JWTs**: Asymmetric signing (private key signs, public key verifies)

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker 20+

### Setup

```bash
# Clone and enter directory
git clone <repo-url>
cd mancom-backend

# Run setup (installs deps, generates keys, starts Docker, builds)
make setup

# Start development servers
make dev
```

### Verify

```bash
curl http://localhost:3001/health
# {"success":true,"data":{"status":"ok","service":"auth-service",...}}
```

---

## Project Structure

```
mancom-backend/
├── packages/                    # Shared packages
│   ├── common/                  # Guards, decorators, filters, interfaces
│   │   └── src/
│   │       ├── decorators/      # @Public(), @Roles(), @CurrentUser()
│   │       ├── guards/          # JwtAuthGuard, RolesGuard
│   │       ├── filters/         # HttpExceptionFilter
│   │       ├── interceptors/    # TransformInterceptor
│   │       └── interfaces/      # JwtPayload, UserContext, ApiResponse
│   └── jwt-utils/               # JWT signing and verification (RS256)
│       └── src/
│           ├── jwt.service.ts   # generateTokenPair(), verifyAccessToken()
│           └── jwt.config.ts    # Configuration interface
│
├── services/                    # Microservices
│   ├── auth-service/            # Authentication service (port 3001)
│   │   └── src/
│   │       ├── auth/            # Token exchange, refresh, logout
│   │       ├── health/          # Health check endpoint
│   │       └── config/          # Environment configuration
│   └── visitor-service/         # Visitor management (port 3002) [placeholder]
│
├── docs/                        # Technical documentation
│   ├── architecture/            # System design, auth flow, diagrams
│   ├── api/                     # API conventions, error codes, endpoints
│   └── runbooks/                # Setup, debugging, troubleshooting
│
├── guides/                      # Developer guides (for onboarding)
│   ├── onboarding/              # Day 1-3 setup and learning
│   ├── coding-standards/        # TypeScript, NestJS, naming conventions
│   ├── development/             # Git workflow, commits, PRs
│   ├── testing/                 # Unit tests, integration tests
│   ├── tutorials/               # Adding services, endpoints, guards
│   └── references/              # Glossary, roles, env vars, commands
│
├── scripts/                     # Automation scripts
│   ├── setup.sh                 # First-time setup
│   └── generate-keys.sh         # Generate RS256 JWT keys
│
├── docker/                      # Docker configuration
│   ├── docker-compose.yml       # PostgreSQL + Redis for development
│   └── docker-compose.test.yml  # Test environment
│
├── .github/                     # GitHub configuration
│   ├── workflows/ci.yml         # CI pipeline (lint, test, build)
│   ├── ISSUE_TEMPLATE/          # Bug, feature, task templates
│   └── pull_request_template.md # PR template
│
├── package.json                 # Root package with workspace scripts
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── turbo.json                   # Turborepo build pipeline
├── tsconfig.base.json           # Shared TypeScript configuration
├── Makefile                     # Developer commands
└── .env.example                 # Environment variables template
```

---

## Authentication Flow

Mancom uses a **hybrid authentication** model:

```
┌────────┐     ┌─────────┐     ┌─────────────┐     ┌──────────────┐
│ Client │     │ Appwrite│     │ Auth Service│     │Other Services│
└───┬────┘     └────┬────┘     └──────┬──────┘     └──────┬───────┘
    │               │                 │                   │
    │ 1. Login (OTP/OAuth)            │                   │
    │──────────────>│                 │                   │
    │               │                 │                   │
    │ Appwrite JWT  │                 │                   │
    │<──────────────│                 │                   │
    │               │                 │                   │
    │ 2. POST /auth/token             │                   │
    │────────────────────────────────>│                   │
    │               │  3. Verify      │                   │
    │               │<────────────────│                   │
    │               │                 │                   │
    │ 4. Mancom tokens (access + refresh)                 │
    │<────────────────────────────────│                   │
    │               │                 │                   │
    │ 5. API request + accessToken    │                   │
    │─────────────────────────────────────────────────────>
    │               │                 │  6. Verify (public key)
    │ 7. Response   │                 │                   │
    │<─────────────────────────────────────────────────────
```

**Why this approach?**
- Appwrite handles complex auth (OTP, OAuth, session management)
- Our services validate JWTs independently (no Appwrite calls at runtime)
- Tokens contain user roles and society context for authorization

See [Auth Flow Documentation](docs/architecture/auth-flow.md) for details.

---

## Services

### Auth Service (Port 3001)

Handles authentication token exchange and management.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/token` | POST | Public | Exchange Appwrite JWT for Mancom tokens |
| `/auth/refresh` | POST | Public | Refresh token pair |
| `/auth/logout` | POST | Public | Invalidate refresh token |
| `/auth/me` | GET | Required | Get current user info |
| `/health` | GET | Public | Health check |

### Visitor Service (Port 3002)

*Placeholder - not yet implemented*

See [Adding a New Service](guides/tutorials/adding-new-service.md) for implementation guide.

---

## Packages

### @mancom/common

Shared utilities used by all services:

| Export | Purpose |
|--------|---------|
| `JwtAuthGuard` | Validates JWT on protected routes |
| `RolesGuard` | Enforces role-based access control |
| `@Public()` | Marks routes as public (no auth required) |
| `@Roles()` | Specifies required roles for a route |
| `@CurrentUser()` | Extracts user context from request |
| `HttpExceptionFilter` | Formats error responses |
| `TransformInterceptor` | Wraps success responses |
| `JwtPayload` | JWT token structure interface |
| `UserContext` | Authenticated user interface |
| `ApiResponse` | Standard response interface |

### @mancom/jwt-utils

JWT signing and verification using RS256:

| Export | Purpose |
|--------|---------|
| `JwtService` | Sign and verify tokens |
| `generateTokenPair()` | Create access + refresh tokens |
| `verifyAccessToken()` | Verify and decode access token |
| `verifyRefreshToken()` | Verify and decode refresh token |

---

## Commands

### Make Commands

```bash
make setup          # First-time setup (install, keys, docker, build)
make dev            # Start all services in watch mode
make dev-auth       # Start auth-service only
make test           # Run all tests
make test-cov       # Run tests with coverage
make lint           # Run ESLint
make lint-fix       # Fix lint issues
make format         # Format with Prettier
make docker-up      # Start PostgreSQL + Redis
make docker-down    # Stop Docker containers
make docker-logs    # View Docker logs
make generate-keys  # Generate JWT key pair
make clean          # Remove build artifacts
make help           # Show all commands
```

### pnpm Commands

```bash
pnpm install                              # Install dependencies
pnpm build                                # Build all packages
pnpm dev                                  # Start all services
pnpm test                                 # Run all tests
pnpm test --filter=@mancom/auth-service   # Test specific package
pnpm lint                                 # Lint all packages
```

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# JWT (generate with: make generate-keys)
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mancom
DATABASE_USER=mancom
DATABASE_PASSWORD=mancom_dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

See [Environment Variables Reference](guides/references/environment-variables.md) for complete list.

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VISITOR_NOT_FOUND",
    "message": "Visitor not found",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/visitors/invalid-id"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Documentation

### Technical Docs

| Document | Description |
|----------|-------------|
| [Architecture Overview](docs/architecture/overview.md) | System design and technology choices |
| [Auth Flow](docs/architecture/auth-flow.md) | Authentication sequence and JWT structure |
| [Service Communication](docs/architecture/service-communication.md) | How services interact |
| [API Conventions](docs/api/conventions.md) | Request/response standards |
| [Error Codes](docs/api/error-codes.md) | Complete error reference |
| [Local Setup](docs/runbooks/local-setup.md) | Development environment setup |
| [Debugging](docs/runbooks/debugging.md) | Debugging guide |
| [Common Issues](docs/runbooks/common-issues.md) | Troubleshooting FAQ |

### Developer Guides

| Guide | Description |
|-------|-------------|
| [Day 1 Setup](guides/onboarding/day-1-setup.md) | Get your environment running |
| [Day 2 Codebase Tour](guides/onboarding/day-2-codebase-tour.md) | Understand the code |
| [Day 3 First Task](guides/onboarding/day-3-first-task.md) | Make your first contribution |
| [TypeScript Standards](guides/coding-standards/typescript.md) | Language conventions |
| [NestJS Patterns](guides/coding-standards/nestjs-patterns.md) | Framework patterns |
| [Git Workflow](guides/development/git-workflow.md) | Branching and merging |
| [Commit Messages](guides/development/commit-messages.md) | Conventional commits |
| [Adding a Service](guides/tutorials/adding-new-service.md) | Create new microservice |
| [Adding an Endpoint](guides/tutorials/adding-new-endpoint.md) | Add API endpoint |

---

## Contributing

1. Read the [Contributing Guide](CONTRIBUTING.md)
2. Follow [Coding Standards](guides/coding-standards/typescript.md)
3. Use [Conventional Commits](guides/development/commit-messages.md)
4. Create focused PRs with tests

### Branch Naming

```
feature/ABC-123-add-visitor-approval
fix/ABC-124-token-expiry-bug
docs/ABC-125-update-readme
```

### Commit Format

```
feat(visitor): add approval endpoint
fix(auth): handle expired refresh tokens
docs(readme): update project structure
```

---

## License

UNLICENSED - Proprietary
