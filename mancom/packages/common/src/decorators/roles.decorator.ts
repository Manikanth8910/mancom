import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Specifies which roles are allowed to access a route.
 * Used with RolesGuard to enforce role-based access control.
 *
 * @param roles - Array of role names that can access this route
 *
 * @example
 * ```typescript
 * @Roles('admin', 'committee')
 * @Get('settings')
 * getSettings() {
 *   return this.settingsService.getAll();
 * }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
