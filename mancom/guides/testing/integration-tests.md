# Integration Tests

## When to Use

Use integration tests when you need to test:
- Controller + Service interaction
- Request validation
- Response transformation
- Multiple components working together

## Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('VisitorsController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(VisitorsRepository)
      .useValue(mockRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Tests go here
});
```

## Testing Endpoints

### GET Request

```typescript
describe('GET /visitors', () => {
  it('should return visitors for authenticated user', async () => {
    mockRepository.findByFlat.mockResolvedValue([
      { id: '1', name: 'John', status: 'pending' },
    ]);

    const response = await request(app.getHttpServer())
      .get('/visitors')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('John');
  });

  it('should return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/visitors')
      .expect(401);
  });
});
```

### POST Request

```typescript
describe('POST /visitors', () => {
  it('should create a visitor', async () => {
    const dto = {
      name: 'Jane Smith',
      phone: '+919876543210',
      purpose: 'guest',
      expectedDate: '2024-01-15',
    };

    mockRepository.create.mockResolvedValue({
      id: 'vis-1',
      ...dto,
      status: 'pending',
    });

    const response = await request(app.getHttpServer())
      .post('/visitors')
      .set('Authorization', `Bearer ${validToken}`)
      .send(dto)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('vis-1');
    expect(response.body.data.status).toBe('pending');
  });

  it('should validate required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/visitors')
      .set('Authorization', `Bearer ${validToken}`)
      .send({}) // Missing required fields
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });
});
```

### PATCH Request

```typescript
describe('PATCH /visitors/:id/approve', () => {
  it('should approve visitor for security role', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'vis-1',
      status: 'pending',
    });
    mockRepository.update.mockResolvedValue({
      id: 'vis-1',
      status: 'approved',
    });

    const response = await request(app.getHttpServer())
      .patch('/visitors/vis-1/approve')
      .set('Authorization', `Bearer ${securityToken}`)
      .send({ action: 'approve' })
      .expect(200);

    expect(response.body.data.status).toBe('approved');
  });

  it('should reject for non-security role', async () => {
    await request(app.getHttpServer())
      .patch('/visitors/vis-1/approve')
      .set('Authorization', `Bearer ${residentToken}`)
      .send({ action: 'approve' })
      .expect(403);
  });
});
```

## Database Integration Tests

For tests that need a real database:

```typescript
describe('VisitorsRepository (Database)', () => {
  let repository: VisitorsRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433, // Test database port
          username: 'mancom_test',
          password: 'mancom_test_password',
          database: 'mancom_test',
          entities: [Visitor],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Visitor]),
      ],
      providers: [VisitorsRepository],
    }).compile();

    repository = module.get<VisitorsRepository>(VisitorsRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // Clean up before each test
    await dataSource.query('TRUNCATE visitors CASCADE');
  });

  it('should create and retrieve visitor', async () => {
    const visitor = await repository.create({
      name: 'Test Visitor',
      phone: '+919876543210',
      purpose: 'guest',
      flatId: 'flat-1',
      societyId: 'soc-1',
    });

    const found = await repository.findById(visitor.id);

    expect(found).toBeDefined();
    expect(found.name).toBe('Test Visitor');
  });
});
```

## Test Helpers

Create helpers for common operations:

```typescript
// test/helpers.ts
export function createTestUser(overrides = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['resident'],
    societyId: 'soc-1',
    flatId: 'flat-1',
    ...overrides,
  };
}

export function createTestVisitor(overrides = {}) {
  return {
    id: 'vis-1',
    name: 'Test Visitor',
    phone: '+919876543210',
    purpose: 'guest',
    status: 'pending',
    ...overrides,
  };
}

export async function generateTestToken(user: UserContext) {
  // Generate a valid JWT for testing
}
```

## When to Use Integration vs Unit

| Scenario | Test Type |
|----------|-----------|
| Service business logic | Unit |
| Request validation | Integration |
| Response format | Integration |
| Database queries | Integration |
| Authorization checks | Integration |
| Complex multi-service flow | Integration |
