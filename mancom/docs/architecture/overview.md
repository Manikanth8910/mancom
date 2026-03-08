# System Architecture Overview

## High-Level Architecture

Mancom backend is a microservices-based platform for residential society management.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
│              (Mobile App, Web App, Admin Portal)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway                                │
│                    (Future: Kong/Nginx)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Auth Service │    │Visitor Service│    │ Other Services│
│   (Port 3001) │    │  (Port 3002)  │    │    (300X)     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   PostgreSQL  │    │     Redis     │    │   Appwrite    │
│   (Database)  │    │    (Cache)    │    │    (Auth)     │
└───────────────┘    └───────────────┘    └───────────────┘
```

## Service Responsibilities

### Auth Service (Port 3001)

- Exchanges Appwrite sessions for Mancom JWTs
- Issues and refreshes token pairs
- Manages token invalidation (logout)

### Visitor Service (Port 3002)

- Visitor pre-registration
- Entry approval workflow
- Visitor history and reports

### Future Services

- **Society Service**: Society and flat management
- **Maintenance Service**: Maintenance requests
- **Billing Service**: Due payments and invoices
- **Notification Service**: Push, SMS, email notifications

## Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20+ | Team familiarity, async performance |
| Framework | NestJS 10+ | Enterprise patterns, TypeScript first |
| Language | TypeScript 5+ | Type safety, better tooling |
| Database | PostgreSQL | Relational data, ACID compliance |
| Cache | Redis | Session storage, rate limiting |
| Auth Provider | Appwrite | Managed auth, multiple login methods |
| Monorepo | pnpm + Turborepo | Fast installs, efficient caching |

## Key Design Decisions

### 1. Hybrid Authentication

Appwrite handles user authentication (login UI, OTP, OAuth). Our auth-service issues JWTs that other services validate independently. This decouples services from Appwrite at runtime.

See [Auth Flow](auth-flow.md) for details.

### 2. Shared Packages

Common code lives in `packages/`:

- `@mancom/common`: Guards, decorators, filters, interfaces
- `@mancom/jwt-utils`: JWT signing and verification

Services depend on these packages, ensuring consistency.

### 3. Feature-Based Structure

Each service organizes code by feature, not layer:

```
service/
└── src/
    ├── visitors/       # Feature module
    │   ├── visitors.controller.ts
    │   ├── visitors.service.ts
    │   ├── visitors.repository.ts
    │   └── dto/
    └── approvals/      # Another feature
```

### 4. Standard Response Format

All APIs use consistent response envelopes:

```json
// Success
{ "success": true, "data": {...}, "meta": {...} }

// Error
{ "success": false, "error": {...}, "meta": {...} }
```

## Diagrams

See [diagrams/system-architecture.mermaid](diagrams/system-architecture.mermaid) for detailed diagrams.
