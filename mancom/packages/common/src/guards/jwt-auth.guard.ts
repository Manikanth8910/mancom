import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload, UserContext } from '../interfaces';

/**
 * Interface for the JWT verification service.
 * Services must provide this to use JwtAuthGuard.
 */
export interface JwtVerifier {
  verifyAccessToken(token: string): Promise<JwtPayload>;
}

export const JWT_VERIFIER = 'JWT_VERIFIER';

/**
 * Guard that validates Mancom JWTs on protected routes.
 * Automatically skips routes marked with @Public() decorator.
 *
 * After successful verification, attaches UserContext to request.user.
 *
 * @example
 * ```typescript
 * // Apply globally in main.ts
 * app.useGlobalGuards(app.get(JwtAuthGuard));
 *
 * // Or per-controller
 * @UseGuards(JwtAuthGuard)
 * @Controller('visitors')
 * export class VisitorController {}
 * ```
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWT_VERIFIER) private readonly jwtVerifier: JwtVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: UserContext;
    }>();

    const token = this.extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException({
        code: 'MISSING_TOKEN',
        message: 'Authorization token is required',
      });
    }

    try {
      const payload = await this.jwtVerifier.verifyAccessToken(token);

      // Attach user context to request
      request.user = this.mapPayloadToUserContext(payload);

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      });
    }
  }

  private extractTokenFromHeader(authHeader?: string): string | undefined {
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private mapPayloadToUserContext(payload: JwtPayload): UserContext {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
      societyId: payload.societyId,
      flatId: payload.flatId,
    };
  }
}
