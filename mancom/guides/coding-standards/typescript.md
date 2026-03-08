# TypeScript Standards

## Configuration

We use TypeScript 5+ with strict mode. See `tsconfig.base.json` for full config.

Key settings:
- `strict: true` - All strict checks enabled
- `noImplicitAny: true` - No implicit any types
- `strictNullChecks: true` - Null/undefined handled explicitly

## Types vs Interfaces

Use **interfaces** for object shapes:

```typescript
// Good
interface UserContext {
  id: string;
  name: string;
}

// Avoid
type UserContext = {
  id: string;
  name: string;
};
```

Use **types** for unions, intersections, and primitives:

```typescript
// Good
type Status = 'pending' | 'approved' | 'rejected';
type ID = string | number;
type Handler = (event: Event) => void;
```

## Type Definitions

### Always type function parameters and returns:

```typescript
// Good
function createUser(data: CreateUserDto): Promise<User> {
  // ...
}

// Avoid (implicit any return)
function createUser(data: CreateUserDto) {
  // ...
}
```

### Use generics for reusable types:

```typescript
// Good
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Usage
const response: ApiResponse<User> = { success: true, data: user };
```

### Prefer explicit types over inference for public APIs:

```typescript
// Good - explicit return type
export function getUsers(): User[] {
  return users;
}

// Acceptable for private/internal
private processItem(item) {
  return item.value * 2;  // inference is fine here
}
```

## Null Handling

### Use optional chaining:

```typescript
// Good
const name = user?.profile?.name;

// Avoid
const name = user && user.profile && user.profile.name;
```

### Use nullish coalescing:

```typescript
// Good
const limit = options.limit ?? 20;

// Avoid (treats 0 as falsy)
const limit = options.limit || 20;
```

### Be explicit about null vs undefined:

```typescript
// Good - explicit optional
interface Config {
  timeout?: number;  // may be undefined
}

// Good - explicit nullable
interface Result {
  error: Error | null;  // explicitly can be null
}
```

## Async/Await

### Always use async/await over raw promises:

```typescript
// Good
async function fetchUser(id: string): Promise<User> {
  const response = await this.httpService.get(`/users/${id}`);
  return response.data;
}

// Avoid
function fetchUser(id: string): Promise<User> {
  return this.httpService.get(`/users/${id}`).then(r => r.data);
}
```

### Handle errors with try/catch:

```typescript
// Good
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await this.httpService.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    this.logger.error(`Failed to fetch user ${id}`, error);
    throw new NotFoundException('User not found');
  }
}
```

### Avoid fire-and-forget promises:

```typescript
// Bad - unhandled rejection
this.emailService.sendWelcome(user.email);

// Good - handle or explicitly ignore
await this.emailService.sendWelcome(user.email);

// Or if truly fire-and-forget
this.emailService.sendWelcome(user.email).catch(e =>
  this.logger.error('Failed to send email', e)
);
```

## Enums vs Union Types

Prefer union types for simple cases:

```typescript
// Good
type Status = 'pending' | 'approved' | 'rejected';

// Acceptable for complex cases needing runtime values
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
```

## Common Mistakes

### Don't use `any`:

```typescript
// Bad
function process(data: any) { ... }

// Good
function process(data: unknown) {
  if (isValidData(data)) { ... }
}
```

### Don't use `!` (non-null assertion) except for tests:

```typescript
// Bad
const name = user!.name;

// Good
if (user) {
  const name = user.name;
}

// Or with guard
const name = user?.name ?? 'Unknown';
```

### Don't cast unnecessarily:

```typescript
// Bad
const id = req.params.id as string;

// Good - validate instead
const id = req.params.id;
if (typeof id !== 'string') {
  throw new BadRequestException('Invalid ID');
}
```

## Examples

### Good TypeScript:

```typescript
interface CreateVisitorDto {
  name: string;
  phone: string;
  purpose: VisitorPurpose;
  expectedDate: string;
  notes?: string;
}

type VisitorPurpose = 'delivery' | 'guest' | 'service' | 'other';

async function createVisitor(dto: CreateVisitorDto): Promise<Visitor> {
  const visitor: Visitor = {
    id: generateId(),
    ...dto,
    status: 'pending',
    createdAt: new Date(),
  };

  await this.repository.save(visitor);
  return visitor;
}
```

### Bad TypeScript:

```typescript
// Missing types, any usage, implicit returns
function createVisitor(dto) {
  const visitor = {
    id: generateId(),
    ...dto,
    status: 'pending',
    createdAt: new Date(),
  };

  this.repository.save(visitor);  // fire-and-forget
  return visitor as any;
}
```
