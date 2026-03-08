# Error Handling

Guide to handling errors consistently across services.

## Exception Types

Use NestJS built-in exceptions:

| Exception | Status | When to Use |
|-----------|--------|-------------|
| `BadRequestException` | 400 | Invalid input format |
| `UnauthorizedException` | 401 | Missing or invalid auth |
| `ForbiddenException` | 403 | Valid auth, no permission |
| `NotFoundException` | 404 | Resource doesn't exist |
| `ConflictException` | 409 | Resource already exists |
| `UnprocessableEntityException` | 422 | Validation failed |
| `InternalServerErrorException` | 500 | Unexpected server error |

## Throwing Exceptions

Always include an error code and message:

```typescript
// Good
throw new NotFoundException({
  code: 'VISITOR_NOT_FOUND',
  message: 'Visitor not found',
});

// Also Good - with details
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Validation failed',
  details: {
    phone: 'Must be a valid phone number',
  },
});

// Bad - loses structure
throw new NotFoundException('Visitor not found');
```

## Error Codes

Use SCREAMING_SNAKE_CASE for codes:

```typescript
// Domain-specific codes
'VISITOR_NOT_FOUND'
'VISITOR_LIMIT_REACHED'
'VISITOR_ALREADY_APPROVED'

// Generic codes
'VALIDATION_ERROR'
'NOT_FOUND'
'UNAUTHORIZED'
```

## Service Layer

Handle expected errors, let unexpected errors bubble:

```typescript
@Injectable()
export class VisitorsService {
  async findById(id: string): Promise<Visitor> {
    const visitor = await this.repository.findById(id);

    // Expected case - visitor might not exist
    if (!visitor) {
      throw new NotFoundException({
        code: 'VISITOR_NOT_FOUND',
        message: 'Visitor not found',
      });
    }

    return visitor;
  }

  async approve(id: string, userId: string): Promise<Visitor> {
    const visitor = await this.findById(id); // Let NotFoundException bubble

    // Business rule violation
    if (visitor.status !== 'pending') {
      throw new ConflictException({
        code: 'VISITOR_ALREADY_PROCESSED',
        message: `Visitor is already ${visitor.status}`,
      });
    }

    visitor.status = 'approved';
    visitor.approvedBy = userId;

    return this.repository.save(visitor);
  }
}
```

## Controller Layer

Controllers should rarely catch exceptions:

```typescript
// Good - let exceptions propagate
@Post()
async create(@Body() dto: CreateVisitorDto) {
  return this.visitorsService.create(dto); // Exceptions handled by filter
}

// Bad - unnecessary try/catch
@Post()
async create(@Body() dto: CreateVisitorDto) {
  try {
    return this.visitorsService.create(dto);
  } catch (error) {
    throw error; // Pointless
  }
}
```

## Wrapping External Errors

When calling external services, wrap their errors:

```typescript
async verifyWithAppwrite(jwt: string): Promise<User> {
  try {
    return await this.appwriteClient.getUser(jwt);
  } catch (error) {
    // Log original error for debugging
    this.logger.warn('Appwrite verification failed', error);

    // Throw our error format
    throw new UnauthorizedException({
      code: 'INVALID_APPWRITE_SESSION',
      message: 'Invalid or expired Appwrite session',
    });
  }
}
```

## Validation Errors

Use class-validator with ValidationPipe:

```typescript
// DTO with validation
export class CreateVisitorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPhoneNumber('IN')
  phone: string;
}

// ValidationPipe transforms errors automatically
// Response:
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": {
      "name": ["name should not be empty"],
      "phone": ["phone must be a valid phone number"]
    }
  }
}
```

## Custom Exceptions

For domain-specific errors, create custom exceptions:

```typescript
// src/exceptions/visitor-limit.exception.ts
import { BadRequestException } from '@nestjs/common';

export class VisitorLimitException extends BadRequestException {
  constructor(limit: number) {
    super({
      code: 'VISITOR_LIMIT_REACHED',
      message: `Maximum of ${limit} pending visitors allowed`,
    });
  }
}

// Usage
throw new VisitorLimitException(10);
```

## Error Messages

### User-Friendly Messages

Messages are shown to users - make them helpful:

```typescript
// Good
'Visitor not found'
'You do not have permission to approve visitors'
'Maximum of 10 pending visitors allowed'

// Bad
'Entity with id abc not found in visitors table'
'RBAC check failed for resource visitor'
'Constraint violation: max_pending_visitors'
```

### Don't Expose Internals

Never expose:
- Stack traces
- Database errors
- Internal IDs
- System paths

```typescript
// Bad - exposes internal error
throw new InternalServerErrorException(error.message);

// Good - generic message
this.logger.error('Database error', error);
throw new InternalServerErrorException({
  code: 'INTERNAL_ERROR',
  message: 'An unexpected error occurred',
});
```

## Response Format

The global filter formats all errors consistently:

```json
{
  "success": false,
  "error": {
    "code": "VISITOR_NOT_FOUND",
    "message": "Visitor not found"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/visitors/invalid-id"
  }
}
```

## Logging Errors

Log errors appropriately:

```typescript
// 4xx errors - debug/warn level
this.logger.warn(`Visitor ${id} not found`);

// 5xx errors - error level with stack
this.logger.error('Failed to save visitor', error.stack);
```

## Checklist

- [ ] Use appropriate exception type
- [ ] Include error code
- [ ] User-friendly message
- [ ] Don't expose internals
- [ ] Log appropriately
- [ ] Let filter handle formatting
