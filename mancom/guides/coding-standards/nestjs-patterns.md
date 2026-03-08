# NestJS Patterns

## Module Organization

Each feature gets its own module:

```typescript
// visitors/visitors.module.ts
@Module({
  imports: [DatabaseModule],
  controllers: [VisitorsController],
  providers: [VisitorsService, VisitorsRepository],
  exports: [VisitorsService],
})
export class VisitorsModule {}
```

Keep modules focused. If a module grows too large, split it.

## Controllers (Thin)

Controllers should only:
- Define routes
- Validate input (via DTOs)
- Call services
- Return responses

```typescript
// Good - thin controller
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  async create(
    @Body() dto: CreateVisitorDto,
    @CurrentUser() user: UserContext,
  ): Promise<Visitor> {
    return this.visitorsService.create(dto, user);
  }
}

// Bad - business logic in controller
@Controller('visitors')
export class VisitorsController {
  @Post()
  async create(@Body() dto: CreateVisitorDto) {
    // Don't do this - move to service
    const exists = await this.repo.findByPhone(dto.phone);
    if (exists) throw new ConflictException();
    const visitor = await this.repo.create(dto);
    await this.emailService.notify(visitor);
    return visitor;
  }
}
```

## Services (Business Logic)

Services contain all business logic:

```typescript
@Injectable()
export class VisitorsService {
  constructor(
    private readonly repository: VisitorsRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateVisitorDto, user: UserContext): Promise<Visitor> {
    // Validation
    await this.validateVisitorLimit(user);

    // Business logic
    const visitor = await this.repository.create({
      ...dto,
      createdBy: user.id,
      societyId: user.societyId,
      flatId: user.flatId,
      status: 'pending',
    });

    // Side effects
    await this.notificationService.notifySecurity(visitor);

    return visitor;
  }

  private async validateVisitorLimit(user: UserContext): Promise<void> {
    const count = await this.repository.countPendingByFlat(user.flatId);
    if (count >= 10) {
      throw new BadRequestException({
        code: 'VISITOR_LIMIT_REACHED',
        message: 'Maximum pending visitors reached',
      });
    }
  }
}
```

## Repositories (Data Access)

Separate data access into repositories:

```typescript
@Injectable()
export class VisitorsRepository {
  constructor(
    @InjectRepository(Visitor)
    private readonly repo: Repository<Visitor>,
  ) {}

  async create(data: Partial<Visitor>): Promise<Visitor> {
    const visitor = this.repo.create(data);
    return this.repo.save(visitor);
  }

  async findById(id: string): Promise<Visitor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByFlat(flatId: string, options?: PaginationOptions): Promise<Visitor[]> {
    return this.repo.find({
      where: { flatId },
      take: options?.limit,
      skip: options?.offset,
      order: { createdAt: 'DESC' },
    });
  }
}
```

## Guards vs Interceptors vs Pipes

| Component | Use For |
|-----------|---------|
| Guards | Authentication, authorization |
| Interceptors | Transform response, logging, caching |
| Pipes | Validation, transformation of input |

### Guard Example:

```typescript
@Injectable()
export class SocietyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const societyId = request.params.societyId;

    // User can only access their society
    return user.societyId === societyId;
  }
}
```

### Interceptor Example:

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log(`${request.method} ${request.url} - ${duration}ms`);
      }),
    );
  }
}
```

### Pipe Example:

```typescript
@Injectable()
export class ParseUuidPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException('Invalid UUID format');
    }
    return value;
  }
}

// Usage
@Get(':id')
findOne(@Param('id', ParseUuidPipe) id: string) { ... }
```

## Dependency Injection

### Inject via constructor:

```typescript
@Injectable()
export class VisitorsService {
  constructor(
    private readonly repository: VisitorsRepository,
    private readonly configService: ConfigService,
  ) {}
}
```

### Use tokens for interfaces:

```typescript
// Define token
export const JWT_VERIFIER = 'JWT_VERIFIER';

// Register provider
{
  provide: JWT_VERIFIER,
  useExisting: AuthService,
}

// Inject
constructor(@Inject(JWT_VERIFIER) private verifier: JwtVerifier) {}
```

## Error Handling

Throw NestJS exceptions with structured error data:

```typescript
// Good
throw new NotFoundException({
  code: 'VISITOR_NOT_FOUND',
  message: 'Visitor not found',
});

// Bad - loses structure
throw new NotFoundException('Visitor not found');
```

Let the global filter handle formatting. Don't catch and re-throw unless adding context.

## DTOs

Use class-validator for validation:

```typescript
export class CreateVisitorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsEnum(VisitorPurpose)
  purpose: VisitorPurpose;

  @IsDateString()
  expectedDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
```

## Common Mistakes

### Don't inject repositories directly into controllers:

```typescript
// Bad
@Controller('visitors')
export class VisitorsController {
  constructor(private repo: VisitorsRepository) {}
}

// Good - go through service
@Controller('visitors')
export class VisitorsController {
  constructor(private service: VisitorsService) {}
}
```

### Don't mix concerns in services:

```typescript
// Bad - HTTP concerns in service
@Injectable()
export class VisitorsService {
  async create(request: Request) {
    const user = request.user;  // Don't access request here
  }
}

// Good - receive what you need
@Injectable()
export class VisitorsService {
  async create(dto: CreateVisitorDto, user: UserContext) {
    // Use dto and user directly
  }
}
```
