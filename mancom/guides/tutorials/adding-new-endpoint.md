# Adding a New Endpoint

Step-by-step guide to add a new API endpoint.

## Example: Adding GET /visitors/:id

We'll add an endpoint to get visitor details.

## 1. Define the DTO (if needed)

For GET requests with path params, you might not need a DTO.

For POST/PATCH, create request DTO:

```typescript
// src/visitors/dto/create-visitor.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateVisitorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(['delivery', 'guest', 'service', 'other'])
  purpose: string;

  @IsString()
  @IsNotEmpty()
  expectedDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

Export from index:

```typescript
// src/visitors/dto/index.ts
export * from './create-visitor.dto';
```

## 2. Add Service Method

```typescript
// src/visitors/visitors.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { VisitorsRepository } from './visitors.repository';

@Injectable()
export class VisitorsService {
  constructor(private readonly repository: VisitorsRepository) {}

  async findById(id: string, userId: string): Promise<Visitor> {
    const visitor = await this.repository.findById(id);

    if (!visitor) {
      throw new NotFoundException({
        code: 'VISITOR_NOT_FOUND',
        message: 'Visitor not found',
      });
    }

    // Optional: Check user can access this visitor
    // this.validateAccess(visitor, userId);

    return visitor;
  }
}
```

## 3. Add Controller Method

```typescript
// src/visitors/visitors.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, UserContext, Roles } from '@mancom/common';
import { VisitorsService } from './visitors.service';

@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get(':id')
  @Roles('resident', 'security', 'committee')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    return this.visitorsService.findById(id, user.id);
  }
}
```

## 4. Add Repository Method (if needed)

```typescript
// src/visitors/visitors.repository.ts
@Injectable()
export class VisitorsRepository {
  async findById(id: string): Promise<Visitor | null> {
    return this.repo.findOne({ where: { id } });
  }
}
```

## 5. Write Tests

### Service Test

```typescript
// src/visitors/visitors.service.spec.ts
describe('VisitorsService', () => {
  describe('findById', () => {
    it('should return visitor when found', async () => {
      const visitor = { id: 'vis-1', name: 'John' };
      mockRepository.findById.mockResolvedValue(visitor);

      const result = await service.findById('vis-1', 'user-1');

      expect(result).toEqual(visitor);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('invalid', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
```

### Controller Test (Integration)

```typescript
describe('GET /visitors/:id', () => {
  it('should return visitor details', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'vis-1',
      name: 'John',
    });

    const response = await request(app.getHttpServer())
      .get('/visitors/vis-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('John');
  });

  it('should return 404 when visitor not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/visitors/invalid')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
```

## 6. Update API Documentation

Add to `docs/api/visitor-service.md`:

```markdown
## GET /visitors/:id

Get visitor details.

### Request

\`\`\`http
GET /visitors/vis-123
Authorization: Bearer <token>
\`\`\`

### Response

**Success (200):**

\`\`\`json
{
  "success": true,
  "data": {
    "id": "vis-123",
    "name": "Jane Smith",
    "phone": "+919876543210",
    "purpose": "guest",
    "status": "pending"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
\`\`\`

**Errors:**

| Code | Status | Cause |
|------|--------|-------|
| VISITOR_NOT_FOUND | 404 | Visitor doesn't exist |
```

## 7. Run Tests

```bash
pnpm test --filter=@mancom/visitor-service
```

## 8. Test Manually

```bash
# Start the service
make dev-visitor

# Test the endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/visitors/vis-123
```

## Checklist

- [ ] DTO created (if needed)
- [ ] Service method added
- [ ] Controller method added
- [ ] Repository method added (if needed)
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] API docs updated
- [ ] Manual testing done
