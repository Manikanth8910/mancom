# Test Naming

## File Names

```
*.spec.ts      - Unit tests
*.e2e-spec.ts  - End-to-end tests
```

Test file matches source file:
```
visitors.service.ts     → visitors.service.spec.ts
visitors.controller.ts  → visitors.controller.spec.ts
jwt-auth.guard.ts       → jwt-auth.guard.spec.ts
```

## describe() Blocks

Name after the class/function being tested:

```typescript
// Testing a class
describe('VisitorsService', () => { ... });

// Testing a function
describe('validateToken', () => { ... });
```

Nest describes for methods:

```typescript
describe('VisitorsService', () => {
  describe('create', () => { ... });
  describe('findById', () => { ... });
  describe('approve', () => { ... });
});
```

## it() Blocks

Follow this pattern:

```
should [expected behavior] when [condition]
```

### Good Examples

```typescript
it('should return visitor when id exists', () => {});
it('should throw NotFoundException when visitor not found', () => {});
it('should return empty array when no visitors exist', () => {});
it('should hash password when creating user', () => {});
it('should send notification when visitor is approved', () => {});
it('should reject expired tokens', () => {});
```

### Bad Examples

```typescript
it('test', () => {});                    // Too vague
it('works', () => {});                   // Too vague
it('findById', () => {});                // Just the method name
it('testing the create function', () => {});  // Verbose
it('it should work correctly', () => {});     // Redundant "it"
```

## Arrange-Act-Assert

Structure tests with clear sections:

```typescript
it('should create visitor with pending status', async () => {
  // Arrange - Setup test data
  const dto = {
    name: 'John Doe',
    phone: '+919876543210',
    purpose: 'guest',
  };
  const user = createTestUser();
  mockRepository.create.mockResolvedValue({
    id: 'vis-1',
    ...dto,
    status: 'pending',
  });

  // Act - Execute the code
  const result = await service.create(dto, user);

  // Assert - Verify the outcome
  expect(result.status).toBe('pending');
  expect(result.name).toBe('John Doe');
});
```

## Grouping Related Tests

Use nested describe for edge cases:

```typescript
describe('VisitorsService', () => {
  describe('create', () => {
    it('should create visitor with valid data', () => {});
    it('should assign pending status to new visitors', () => {});
    it('should set createdBy to current user', () => {});

    describe('when visitor limit reached', () => {
      it('should throw BadRequestException', () => {});
      it('should not create the visitor', () => {});
    });

    describe('when user has no flat assigned', () => {
      it('should throw ForbiddenException', () => {});
    });
  });
});
```

## Testing Error Cases

Name error tests clearly:

```typescript
describe('approve', () => {
  it('should approve pending visitor', () => {});

  // Error cases
  it('should throw NotFoundException when visitor not found', () => {});
  it('should throw ConflictException when already approved', () => {});
  it('should throw ForbiddenException when user lacks permission', () => {});
});
```

## Complete Example

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockTokenStore: jest.Mocked<TokenStoreService>;

  beforeEach(async () => {
    // Setup
  });

  describe('exchangeToken', () => {
    it('should return token pair when Appwrite JWT is valid', async () => {
      // Arrange
      const appwriteJwt = 'valid-appwrite-jwt';
      mockAppwriteService.verifySession.mockResolvedValue(mockUser);
      mockJwtService.generateTokenPair.mockReturnValue(mockTokenPair);

      // Act
      const result = await service.exchangeToken(appwriteJwt);

      // Assert
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.tokenType).toBe('Bearer');
    });

    it('should throw UnauthorizedException when Appwrite JWT is invalid', async () => {
      // Arrange
      mockAppwriteService.verifySession.mockRejectedValue(new Error());

      // Act & Assert
      await expect(service.exchangeToken('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should store refresh token in Redis', async () => {
      // Arrange
      mockAppwriteService.verifySession.mockResolvedValue(mockUser);
      mockJwtService.generateTokenPair.mockReturnValue(mockTokenPair);

      // Act
      await service.exchangeToken('valid-jwt');

      // Assert
      expect(mockTokenStore.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new token pair when refresh token is valid', async () => {});
    it('should invalidate old refresh token', async () => {});
    it('should throw UnauthorizedException when token expired', async () => {});
    it('should throw UnauthorizedException when token revoked', async () => {});
  });
});
```
