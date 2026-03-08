# Testing Guide

## Overview

We use Jest for testing with the React Native Testing Library for component tests.

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Single file
npm test -- authSlice.test.ts
```

## Test Structure

```
__tests__/
├── store/
│   ├── authSlice.test.ts
│   └── userSlice.test.ts
├── services/
│   └── auth.service.test.ts
├── components/
│   └── Button.test.tsx
└── __mocks__/
    └── api-client.ts
```

## What to Test

### Must Test

1. **Redux slices** - State changes, thunk behavior
2. **Services** - API calls, data transformation
3. **Utility functions** - Validators, formatters
4. **Complex components** - Forms, conditional rendering

### Nice to Test

1. Simple presentational components
2. Navigation flows
3. Integration between features

### Don't Test

1. Third-party libraries
2. Simple pass-through components
3. Styles

## Test File Naming

```
Component.test.tsx    # For React components
feature.test.ts       # For non-React code
```

## Test Structure

Use `describe` and `it` blocks:

```typescript
describe('featureName', () => {
  describe('specificFunction', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Mocking

### Mock Modules

```typescript
jest.mock('../../src/core/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
```

### Mock Functions

```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue({ data: 'async value' });
mockFn.mockRejectedValue(new Error('error'));
```

### Reset Mocks

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Assertions

```typescript
// Equality
expect(value).toBe(expected);
expect(object).toEqual({ key: 'value' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(count).toBeGreaterThan(0);
expect(value).toBeLessThanOrEqual(100);

// Strings
expect(str).toContain('substring');
expect(str).toMatch(/pattern/);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');

// Async
await expect(asyncFn()).resolves.toBe(value);
await expect(asyncFn()).rejects.toThrow();

// Called
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
expect(mockFn).toHaveBeenCalledTimes(2);
```

## Coverage

We aim for:
- 80% coverage for slices
- 80% coverage for services
- 70% coverage for utilities
- 50% coverage overall

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```
