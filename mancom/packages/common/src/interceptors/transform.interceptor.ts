import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../interfaces';

/**
 * Transforms all successful responses into a standard format.
 *
 * Response format:
 * ```json
 * {
 *   "success": true,
 *   "data": { ... },
 *   "meta": {
 *     "timestamp": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Apply globally in main.ts
 * app.useGlobalInterceptors(new TransformInterceptor());
 * ```
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
