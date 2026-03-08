import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserContext } from '../interfaces';

/**
 * Extracts the current user from the request.
 * The user is attached by JwtAuthGuard after token verification.
 *
 * @param data - Optional property name to extract from user context
 *
 * @example
 * ```typescript
 * // Get full user context
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserContext) {
 *   return this.userService.getProfile(user.id);
 * }
 *
 * // Get specific property
 * @Get('my-society')
 * getMySociety(@CurrentUser('societyId') societyId: string) {
 *   return this.societyService.getById(societyId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserContext | undefined, ctx: ExecutionContext): UserContext | unknown => {
    const request = ctx.switchToHttp().getRequest<{ user: UserContext }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
