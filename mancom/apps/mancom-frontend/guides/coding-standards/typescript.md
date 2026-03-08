# TypeScript Standards

## Strict Mode

We use strict TypeScript. The following compiler options are enabled:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

## Types vs Interfaces

### Use `interface` for:

- Object shapes
- Props definitions
- State definitions
- API response types

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string | null;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}
```

### Use `type` for:

- Union types
- Primitive aliases
- Function types
- Mapped/utility types

```typescript
// Good
type Status = 'pending' | 'approved' | 'rejected';
type UserId = string;
type AsyncHandler = () => Promise<void>;
type Nullable<T> = T | null;
```

## No `any`

Never use `any`. Use these alternatives:

```typescript
// Bad
function process(data: any) { ... }

// Good - use unknown for truly unknown types
function process(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}

// Good - use generics for flexible types
function process<T>(data: T): T { ... }

// Good - use specific types
function process(data: Record<string, string>) { ... }
```

## Function Parameters

Always type function parameters:

```typescript
// Bad
function greet(name) {
  return `Hello, ${name}`;
}

// Good
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

## Return Types

Let TypeScript infer return types for simple functions:

```typescript
// Good - inferred
function add(a: number, b: number) {
  return a + b;
}

// Good - explicit for complex returns
function getUser(id: string): User | null {
  // ...
}
```

## Null Handling

Be explicit about null/undefined:

```typescript
// Bad
interface User {
  name: string | undefined;
}

// Good - optional property
interface User {
  name?: string;
}

// Good - explicitly nullable
interface User {
  name: string | null;
}
```

## Async/Await

Always handle async operations properly:

```typescript
// Bad - unhandled promise
async function fetchData() {
  const data = await api.get('/data');
  return data;
}

// Good - with error handling
async function fetchData(): Promise<Data> {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch data');
  }
}
```

## Type Assertions

Avoid type assertions when possible:

```typescript
// Bad
const user = response as User;

// Good - type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

if (isUser(response)) {
  // TypeScript knows response is User
}
```

## Discriminated Unions

Use discriminated unions for state:

```typescript
// Good
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Usage
function render(state: AsyncState<User>) {
  switch (state.status) {
    case 'loading':
      return <Loading />;
    case 'success':
      return <UserCard user={state.data} />;
    case 'error':
      return <Error message={state.error} />;
  }
}
```

## Enums

Prefer const objects over enums:

```typescript
// Avoid
enum Status {
  Pending = 'pending',
  Approved = 'approved',
}

// Prefer
const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
```

## Generic Components

Type generic components properly:

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <>
      {items.map(item => (
        <View key={keyExtractor(item)}>{renderItem(item)}</View>
      ))}
    </>
  );
}
```
