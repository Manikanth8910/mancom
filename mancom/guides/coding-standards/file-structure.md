# File Structure

## Service Structure

Each service follows this structure:

```
service-name/
├── src/
│   ├── feature-a/           # Feature module
│   │   ├── dto/
│   │   │   ├── create-*.dto.ts
│   │   │   ├── update-*.dto.ts
│   │   │   └── index.ts
│   │   ├── entities/        # Database entities (if applicable)
│   │   │   └── *.entity.ts
│   │   ├── feature-a.controller.ts
│   │   ├── feature-a.service.ts
│   │   ├── feature-a.repository.ts  # (if needed)
│   │   ├── feature-a.module.ts
│   │   └── index.ts
│   ├── feature-b/
│   │   └── ...
│   ├── health/              # Health check (every service)
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── config/              # Configuration
│   │   └── configuration.ts
│   ├── app.module.ts        # Root module
│   └── main.ts              # Entry point
├── test/                    # E2E tests
│   └── *.e2e-spec.ts
├── package.json
├── tsconfig.json
├── nest-cli.json
├── jest.config.js
├── .env.example
└── README.md
```

## Feature-Based vs Layer-Based

We use **feature-based** structure:

```
# Good - Feature-based
src/
├── visitors/
│   ├── visitors.controller.ts
│   ├── visitors.service.ts
│   └── visitors.repository.ts
├── approvals/
│   ├── approvals.controller.ts
│   └── approvals.service.ts

# Bad - Layer-based
src/
├── controllers/
│   ├── visitors.controller.ts
│   └── approvals.controller.ts
├── services/
│   ├── visitors.service.ts
│   └── approvals.service.ts
```

Feature-based keeps related code together. When you work on visitors, everything is in one folder.

## Where to Put Things

| File Type | Location |
|-----------|----------|
| Controller | `feature/feature.controller.ts` |
| Service | `feature/feature.service.ts` |
| Repository | `feature/feature.repository.ts` |
| DTOs | `feature/dto/*.dto.ts` |
| Entities | `feature/entities/*.entity.ts` |
| Guards (feature-specific) | `feature/guards/*.guard.ts` |
| Guards (shared) | `packages/common/src/guards/` |
| Interfaces (feature-specific) | `feature/interfaces/*.interface.ts` |
| Interfaces (shared) | `packages/common/src/interfaces/` |
| Utils (shared) | `packages/common/src/utils/` |

## Index Files

Every folder with multiple exports should have an `index.ts`:

```typescript
// dto/index.ts
export * from './create-visitor.dto';
export * from './update-visitor.dto';
export * from './list-visitors-query.dto';
```

This enables clean imports:

```typescript
// Good
import { CreateVisitorDto, UpdateVisitorDto } from './dto';

// Without index.ts
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
```

## Module Organization

Modules should:
1. Import dependencies
2. Declare controllers
3. Provide services
4. Export services needed by other modules

```typescript
// visitors.module.ts
@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,
  ],
  controllers: [VisitorsController],
  providers: [
    VisitorsService,
    VisitorsRepository,
  ],
  exports: [VisitorsService],  // Only if needed by other modules
})
export class VisitorsModule {}
```

## Adding a New Feature

When adding a new feature to a service:

1. Create the feature folder:
   ```
   mkdir -p src/new-feature/dto
   ```

2. Create the files:
   ```
   src/new-feature/
   ├── dto/
   │   ├── create-new-feature.dto.ts
   │   └── index.ts
   ├── new-feature.controller.ts
   ├── new-feature.service.ts
   ├── new-feature.module.ts
   └── index.ts
   ```

3. Register in app.module.ts:
   ```typescript
   @Module({
     imports: [
       // ...
       NewFeatureModule,
     ],
   })
   export class AppModule {}
   ```

## Shared Code

Code used by multiple services goes in packages:

```
packages/
├── common/              # Guards, decorators, interfaces
│   └── src/
│       ├── decorators/
│       ├── guards/
│       ├── filters/
│       ├── interceptors/
│       └── interfaces/
└── jwt-utils/           # JWT-specific utilities
    └── src/
        └── jwt.service.ts
```

### When to Create a Package

Create a package when code is:
- Used by 2+ services
- General-purpose (not feature-specific)
- Stable (unlikely to change frequently)

Don't create packages for:
- Feature-specific logic
- One-off utilities
- Experimental code

## Test Files

Keep tests next to the code they test:

```
visitors/
├── visitors.service.ts
├── visitors.service.spec.ts    # Unit tests here
├── visitors.controller.ts
└── visitors.controller.spec.ts
```

E2E tests go in the `test/` folder:

```
test/
├── visitors.e2e-spec.ts
└── jest-e2e.json
```
