import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserContext } from '../interfaces';

/**
 * Guard that enforces role-based access control.
 * Must be used after JwtAuthGuard to ensure user context is available.
 *
 * If no @Roles() decorator is present, access is allowed (authentication-only).
 * If @Roles() is present, user must have at least one of the specified roles.
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'committee')
 * @Get('admin-panel')
 * getAdminPanel() {}
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required - allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: UserContext }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'NO_USER_CONTEXT',
        message: 'User context not found. Ensure JwtAuthGuard runs before RolesGuard.',
      });
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to access this resource',
      });
    }

    return true;
  }
}
