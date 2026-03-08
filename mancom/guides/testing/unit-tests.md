# Unit Tests

## Setup

We use Jest for testing. Each package/service has its own Jest config.

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@mancom/auth-service

# Watch mode
pnpm test:watch
```

## Test Structure

Tests live next to the code they test:

```
visitors/
├── visitors.service.ts
└── visitors.service.spec.ts
```

## Basic Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { VisitorsService } from './visitors.service';
import { VisitorsRepository } from './visitors.repository';

describe('VisitorsService', () => {
  let service: VisitorsService;
  let repository: jest.Mocked<VisitorsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorsService,
        {
          provide: VisitorsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByFlat: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VisitorsService>(VisitorsService);
    repository = module.get(VisitorsRepository);
  });

  describe('create', () => {
    it('should create a visitor', async () => {
      // Arrange
      const dto = { name: 'John', phone: '+919876543210', purpose: 'guest' };
      const user = { id: 'user-1', flatId: 'flat-1', societyId: 'soc-1' };
      const expected = { id: 'vis-1', ...dto, status: 'pending' };

      repository.create.mockResolvedValue(expected);

      // Act
      const result = await service.create(dto, user);

      // Assert
      expect(result).toEqual(expected);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John',
          createdBy: 'user-1',
        }),
      );
    });
  });
});
```

## Mocking

### Mock Dependencies

```typescript
const mockRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

// In test module
{
  provide: VisitorsRepository,
  useValue: mockRepository,
}
```

### Mock Return Values

```typescript
// Single return
mockRepository.findById.mockResolvedValue({ id: '1', name: 'Test' });

// Different returns per call
mockRepository.findById
  .mockResolvedValueOnce({ id: '1', name: 'First' })
  .mockResolvedValueOnce({ id: '2', name: 'Second' });

// Throw error
mockRepository.findById.mockRejectedValue(new Error('Not found'));
```

### Verify Calls

```typescript
// Was called
expect(mockRepository.create).toHaveBeenCalled();

// Called with specific args
expect(mockRepository.create).toHaveBeenCalledWith({
  name: 'John',
  status: 'pending',
});

// Called specific number of times
expect(mockRepository.create).toHaveBeenCalledTimes(1);

// Partial match
expect(mockRepository.create).toHaveBeenCalledWith(
  expect.objectContaining({ name: 'John' }),
);
```

## Testing Exceptions

```typescript
it('should throw NotFoundException when visitor not found', async () => {
  repository.findById.mockResolvedValue(null);

  await expect(service.findById('invalid-id')).rejects.toThrow(
    NotFoundException,
  );
});

it('should throw with specific error code', async () => {
  repository.findById.mockResolvedValue(null);

  await expect(service.findById('invalid-id')).rejects.toMatchObject({
    response: { code: 'VISITOR_NOT_FOUND' },
  });
});
```

## Testing Guards

```typescript
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockReflector: jest.Mocked<Reflector>;
  let mockJwtVerifier: jest.Mocked<JwtVerifier>;

  beforeEach(() => {
    mockReflector = { getAllAndOverride: jest.fn() } as any;
    mockJwtVerifier = { verifyAccessToken: jest.fn() } as any;
    guard = new JwtAuthGuard(mockReflector, mockJwtVerifier);
  });

  it('should allow access for public routes', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);

    const context = createMockExecutionContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should reject requests without token', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createMockExecutionContext({ authorization: undefined });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

function createMockExecutionContext(headers = { authorization: 'Bearer token' }) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}
```

## Best Practices

### 1. Follow AAA Pattern

```typescript
it('should do something', async () => {
  // Arrange - setup test data and mocks
  const input = { name: 'Test' };
  mockService.process.mockResolvedValue({ id: '1' });

  // Act - call the method being tested
  const result = await service.create(input);

  // Assert - verify the outcome
  expect(result.id).toBe('1');
});
```

### 2. Test One Thing Per Test

```typescript
// Bad - testing multiple things
it('should create and notify', async () => {
  const result = await service.create(dto);
  expect(result).toBeDefined();
  expect(mockNotificationService.send).toHaveBeenCalled();
});

// Good - separate tests
it('should create visitor', async () => {
  const result = await service.create(dto);
  expect(result).toBeDefined();
});

it('should send notification after creation', async () => {
  await service.create(dto);
  expect(mockNotificationService.send).toHaveBeenCalled();
});
```

### 3. Use Descriptive Names

```typescript
// Bad
it('test 1', () => {});
it('should work', () => {});

// Good
it('should throw NotFoundException when visitor does not exist', () => {});
it('should return pending visitors for the given flat', () => {});
```

### 4. Reset Mocks Between Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```
