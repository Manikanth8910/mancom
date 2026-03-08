# Adding a New Guard

Step-by-step guide to create a custom guard.

## When to Create a Guard

Create a guard when you need to:
- Check a condition before allowing access
- Access request/response context
- Make authorization decisions

Don't create a guard for:
- Input validation (use pipes)
- Response transformation (use interceptors)
- Error handling (use filters)

## Example: Society Access Guard

We'll create a guard that ensures users can only access their society's resources.

## 1. Create the Guard

```typescript
// src/guards/society-access.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserContext } from '@mancom/common';

export const SOCIETY_PARAM_KEY = 'societyParamKey';

/**
 * Guard that ensures user can only access their own society's resources.
 * Compares the societyId from the URL param to the user's societyId.
 */
@Injectable()
export class SocietyAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the param name to check (default: 'societyId')
    const paramKey = this.reflector.get<string>(
      SOCIETY_PARAM_KEY,
      context.getHandler(),
    ) || 'societyId';

    const request = context.switchToHttp().getRequest<{
      user: UserContext;
      params: Record<string, string>;
    }>();

    const user = request.user;
    const requestedSocietyId = request.params[paramKey];

    // No society param - allow (let other guards handle)
    if (!requestedSocietyId) {
      return true;
    }

    // No user - deny
    if (!user) {
      throw new ForbiddenException({
        code: 'NO_USER_CONTEXT',
        message: 'User context required',
      });
    }

    // Check society match
    if (user.societyId !== requestedSocietyId) {
      throw new ForbiddenException({
        code: 'SOCIETY_ACCESS_DENIED',
        message: 'You do not have access to this society',
      });
    }

    return true;
  }
}
```

## 2. Create a Decorator (Optional)

Create a decorator to customize the param name:

```typescript
// src/decorators/society-param.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { SOCIETY_PARAM_KEY } from '../guards/society-access.guard';

/**
 * Specifies which URL param contains the society ID.
 * Used with SocietyAccessGuard.
 *
 * @param paramKey - The URL parameter name (default: 'societyId')
 *
 * @example
 * @SocietyParam('id')  // Check :id param
 * @Get(':id/members')
 * getMembers() {}
 */
export const SocietyParam = (paramKey: string) =>
  SetMetadata(SOCIETY_PARAM_KEY, paramKey);
```

## 3. Register the Guard

### Option A: Per-Controller

```typescript
@Controller('societies/:societyId/visitors')
@UseGuards(JwtAuthGuard, SocietyAccessGuard)
export class SocietyVisitorsController {
  @Get()
  listVisitors(@Param('societyId') societyId: string) {
    // User's societyId is guaranteed to match
  }
}
```

### Option B: Per-Method

```typescript
@Controller('visitors')
export class VisitorsController {
  @Get('society/:societyId')
  @UseGuards(SocietyAccessGuard)
  @SocietyParam('societyId')
  listBySociety(@Param('societyId') societyId: string) {
    // Protected by SocietyAccessGuard
  }

  @Get(':id')
  // Not protected by SocietyAccessGuard
  findOne(@Param('id') id: string) {}
}
```

### Option C: Global (Not Recommended)

Only do this if ALL endpoints need this check.

## 4. Write Tests

```typescript
// src/guards/society-access.guard.spec.ts
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SocietyAccessGuard } from './society-access.guard';

describe('SocietyAccessGuard', () => {
  let guard: SocietyAccessGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { get: jest.fn() } as any;
    guard = new SocietyAccessGuard(reflector);
  });

  function createContext(user: any, params: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, params }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;
  }

  it('should allow access when society matches', () => {
    reflector.get.mockReturnValue(undefined);
    const context = createContext(
      { societyId: 'soc-1' },
      { societyId: 'soc-1' },
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when society does not match', () => {
    reflector.get.mockReturnValue(undefined);
    const context = createContext(
      { societyId: 'soc-1' },
      { societyId: 'soc-2' },
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when no society param', () => {
    reflector.get.mockReturnValue(undefined);
    const context = createContext(
      { societyId: 'soc-1' },
      { id: '123' }, // Different param
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should use custom param key from decorator', () => {
    reflector.get.mockReturnValue('id'); // Custom param key
    const context = createContext(
      { societyId: 'soc-1' },
      { id: 'soc-1' },
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
```

## 5. Add to Shared Package (If Reusable)

If other services need this guard, add to `packages/common`:

```
packages/common/src/guards/
├── index.ts
├── jwt-auth.guard.ts
├── roles.guard.ts
└── society-access.guard.ts  # Add here
```

Export from index:

```typescript
export * from './society-access.guard';
```

## Guard Execution Order

Guards run in this order:
1. Global guards
2. Controller guards
3. Method guards

Within each level, guards run in array order:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, SocietyAccessGuard)
// Runs: JwtAuthGuard → RolesGuard → SocietyAccessGuard
```

## Checklist

- [ ] Guard implements CanActivate
- [ ] Returns boolean or throws exception
- [ ] Uses Reflector for metadata (if needed)
- [ ] Has clear error codes and messages
- [ ] Unit tests written
- [ ] Registered where needed
- [ ] Documented in code
