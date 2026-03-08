# Comments and Documentation

## When to Comment

Comment the **why**, not the **what**.

```typescript
// Bad - explains what (obvious from code)
// Loop through visitors and check status
for (const visitor of visitors) {
  if (visitor.status === 'pending') { ... }
}

// Good - explains why
// Expired visitors (>24h old) are auto-rejected to prevent gate clutter
if (isOlderThan(visitor.createdAt, 24, 'hours')) {
  visitor.status = 'rejected';
}
```

## When NOT to Comment

Don't comment:
- Obvious code
- Self-explanatory variable names
- Standard patterns

```typescript
// Bad - unnecessary comments
// Create a new visitor
const visitor = new Visitor();

// Set the name
visitor.name = dto.name;

// Save to database
await this.repository.save(visitor);
```

## JSDoc for Public APIs

Add JSDoc to exported functions, classes, and interfaces:

```typescript
/**
 * Creates a new visitor entry for pre-registration.
 * Validates visitor limits before creation.
 *
 * @param dto - Visitor creation data
 * @param user - Current authenticated user
 * @returns The created visitor
 * @throws BadRequestException if visitor limit reached
 */
async create(dto: CreateVisitorDto, user: UserContext): Promise<Visitor> {
  // ...
}
```

### When to Use JSDoc

| Use JSDoc | Skip JSDoc |
|-----------|------------|
| Public service methods | Private methods |
| Exported interfaces | Internal implementations |
| Complex utility functions | Simple getters/setters |
| Package entry points | Obvious constructors |

## Interface Documentation

Document each field in shared interfaces:

```typescript
/**
 * JWT payload structure for Mancom access tokens.
 */
export interface JwtPayload {
  /** User's unique identifier */
  sub: string;

  /** User's email address */
  email: string;

  /** User's roles for authorization */
  roles: string[];

  /** Token type: 'access' or 'refresh' */
  type: 'access' | 'refresh';
}
```

## README Files

Each service needs a README with:

1. **Purpose** - What the service does
2. **Endpoints** - Table of routes
3. **Configuration** - Required env vars
4. **Running** - How to start locally
5. **Testing** - How to run tests

See `services/auth-service/README.md` as an example.

## TODO Comments

Use TODO for planned work:

```typescript
// TODO: Add rate limiting to this endpoint
// TODO(ABC-123): Implement caching for frequently accessed visitors
```

Include ticket numbers when possible. TODOs should be tracked in the issue tracker, not just in code.

## FIXME Comments

Use FIXME for known issues:

```typescript
// FIXME: This query is slow for large societies - needs optimization
const visitors = await this.repository.findAll(societyId);
```

FIXMEs should have corresponding issues created.

## Inline Documentation Examples

### Good:

```typescript
async approveVisitor(id: string, securityUserId: string): Promise<Visitor> {
  const visitor = await this.findById(id);

  if (!visitor) {
    throw new NotFoundException({ code: 'VISITOR_NOT_FOUND' });
  }

  // Only pending visitors can be approved
  // Completed/rejected visitors require a new entry
  if (visitor.status !== 'pending') {
    throw new ConflictException({
      code: 'VISITOR_ALREADY_PROCESSED',
      message: `Visitor is already ${visitor.status}`,
    });
  }

  visitor.status = 'approved';
  visitor.approvedBy = securityUserId;
  visitor.approvedAt = new Date();

  return this.repository.save(visitor);
}
```

### Bad (over-commented):

```typescript
// This method approves a visitor
async approveVisitor(id: string, securityUserId: string): Promise<Visitor> {
  // Find the visitor by ID
  const visitor = await this.findById(id);

  // Check if visitor exists
  if (!visitor) {
    // Throw not found exception if visitor doesn't exist
    throw new NotFoundException({ code: 'VISITOR_NOT_FOUND' });
  }

  // Check if visitor status is pending
  if (visitor.status !== 'pending') {
    // Throw conflict exception if not pending
    throw new ConflictException({
      code: 'VISITOR_ALREADY_PROCESSED',
      message: `Visitor is already ${visitor.status}`,
    });
  }

  // Set status to approved
  visitor.status = 'approved';
  // Set who approved it
  visitor.approvedBy = securityUserId;
  // Set when it was approved
  visitor.approvedAt = new Date();

  // Save and return the visitor
  return this.repository.save(visitor);
}
```

## Code Clarity Over Comments

If code needs extensive comments to understand, consider refactoring:

```typescript
// Bad - complex logic with explanatory comment
// Check if user can approve: must be security, in same society, during shift hours
if (user.roles.includes('security') && user.societyId === visitor.societyId &&
    currentHour >= 6 && currentHour <= 22) {
  // ...
}

// Good - extract to well-named method
if (this.canUserApproveVisitor(user, visitor)) {
  // ...
}

private canUserApproveVisitor(user: UserContext, visitor: Visitor): boolean {
  return this.isSecurityStaff(user) &&
         this.isInSameSociety(user, visitor) &&
         this.isWithinShiftHours();
}
```
