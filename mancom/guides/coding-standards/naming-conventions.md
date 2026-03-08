# Naming Conventions

## Files

| Type | Convention | Example |
|------|------------|---------|
| Module | `kebab-case.module.ts` | `visitors.module.ts` |
| Controller | `kebab-case.controller.ts` | `visitors.controller.ts` |
| Service | `kebab-case.service.ts` | `visitors.service.ts` |
| Repository | `kebab-case.repository.ts` | `visitors.repository.ts` |
| Guard | `kebab-case.guard.ts` | `jwt-auth.guard.ts` |
| Interceptor | `kebab-case.interceptor.ts` | `transform.interceptor.ts` |
| Filter | `kebab-case.filter.ts` | `http-exception.filter.ts` |
| DTO | `kebab-case.dto.ts` | `create-visitor.dto.ts` |
| Interface | `kebab-case.interface.ts` | `user-context.interface.ts` |
| Test | `kebab-case.spec.ts` | `visitors.service.spec.ts` |
| E2E Test | `kebab-case.e2e-spec.ts` | `visitors.e2e-spec.ts` |

## Classes

Use **PascalCase**:

| Type | Convention | Example |
|------|------------|---------|
| Module | `*Module` | `VisitorsModule` |
| Controller | `*Controller` | `VisitorsController` |
| Service | `*Service` | `VisitorsService` |
| Repository | `*Repository` | `VisitorsRepository` |
| Guard | `*Guard` | `JwtAuthGuard` |
| Interceptor | `*Interceptor` | `TransformInterceptor` |
| Filter | `*Filter` | `HttpExceptionFilter` |
| DTO | `*Dto` | `CreateVisitorDto` |
| Exception | `*Exception` | `VisitorNotFoundException` |
| Entity | singular | `Visitor`, `User` |

## Interfaces

Use **PascalCase**, no "I" prefix:

```typescript
// Good
interface UserContext { ... }
interface JwtPayload { ... }
interface ApiResponse<T> { ... }

// Bad
interface IUserContext { ... }
interface UserContextInterface { ... }
```

## Variables and Functions

Use **camelCase**:

```typescript
// Good
const visitorCount = 10;
const isApproved = true;
function createVisitor() { ... }
async function validateToken() { ... }

// Bad
const visitor_count = 10;
const IsApproved = true;
function CreateVisitor() { ... }
```

## Constants

Use **SCREAMING_SNAKE_CASE** for true constants:

```typescript
// Good
const MAX_VISITORS_PER_FLAT = 10;
const JWT_EXPIRY_SECONDS = 900;
export const IS_PUBLIC_KEY = 'isPublic';

// Variables that happen to not change - use camelCase
const userId = context.user.id;  // not a constant, just final
```

## DTOs

Use descriptive prefixes:

| Action | Prefix | Example |
|--------|--------|---------|
| Create | `Create*Dto` | `CreateVisitorDto` |
| Update | `Update*Dto` | `UpdateVisitorDto` |
| Response | `*ResponseDto` | `VisitorResponseDto` |
| Query | `*QueryDto` | `ListVisitorsQueryDto` |

```typescript
// Request DTOs
class CreateVisitorDto { ... }
class UpdateVisitorDto { ... }

// Query parameters
class ListVisitorsQueryDto {
  page?: number;
  limit?: number;
  status?: string;
}
```

## Methods

Use verb prefixes:

| Action | Prefix | Example |
|--------|--------|---------|
| Get single | `get*`, `find*` | `getById()`, `findByEmail()` |
| Get multiple | `list*`, `findAll*` | `listByFlat()`, `findAll()` |
| Create | `create*` | `create()`, `createVisitor()` |
| Update | `update*` | `update()`, `updateStatus()` |
| Delete | `delete*`, `remove*` | `delete()`, `remove()` |
| Check | `is*`, `has*`, `can*` | `isValid()`, `hasAccess()` |
| Validate | `validate*` | `validateToken()` |

```typescript
class VisitorsService {
  async create(dto: CreateVisitorDto): Promise<Visitor> { ... }
  async findById(id: string): Promise<Visitor | null> { ... }
  async listByFlat(flatId: string): Promise<Visitor[]> { ... }
  async updateStatus(id: string, status: string): Promise<Visitor> { ... }
  async delete(id: string): Promise<void> { ... }
  private validateVisitorLimit(user: UserContext): Promise<void> { ... }
}
```

## Boolean Variables

Use question-like names:

```typescript
// Good
const isActive = true;
const hasPermission = false;
const canEdit = user.roles.includes('admin');
const shouldNotify = config.notifications.enabled;

// Bad
const active = true;
const permission = false;
const edit = true;
```

## Abbreviations

Avoid unless universally understood:

```typescript
// Good
const userId = '123';
const apiKey = 'abc';
const url = 'https://...';

// Bad
const usrId = '123';
const apiK = 'abc';
const unifResLoc = 'https://...';
```

Common acceptable abbreviations:
- `id` (identifier)
- `dto` (data transfer object)
- `api` (application programming interface)
- `url` (uniform resource locator)
- `http` (hypertext transfer protocol)
- `jwt` (JSON web token)

## Examples

### Good Naming:

```typescript
// visitors.service.ts
@Injectable()
export class VisitorsService {
  private readonly logger = new Logger(VisitorsService.name);

  constructor(
    private readonly visitorsRepository: VisitorsRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateVisitorDto, user: UserContext): Promise<Visitor> {
    const hasReachedLimit = await this.hasReachedVisitorLimit(user.flatId);
    if (hasReachedLimit) {
      throw new BadRequestException('Visitor limit reached');
    }

    const visitor = await this.visitorsRepository.create({
      ...dto,
      createdBy: user.id,
    });

    await this.notificationService.notifySecurity(visitor);
    return visitor;
  }

  private async hasReachedVisitorLimit(flatId: string): Promise<boolean> {
    const MAX_PENDING_VISITORS = 10;
    const count = await this.visitorsRepository.countPending(flatId);
    return count >= MAX_PENDING_VISITORS;
  }
}
```

### Bad Naming:

```typescript
// vs.ts
@Injectable()
export class vs {
  constructor(
    private readonly vr: vr,
    private readonly ns: NotifSvc,
  ) {}

  async c(d: CVDto, u: UC): Promise<V> {
    const x = await this.chk(u.fId);
    // ...
  }
}
```
