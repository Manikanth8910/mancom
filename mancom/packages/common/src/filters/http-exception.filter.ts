import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { ApiErrorResponse } from '../interfaces';

interface ExceptionResponse {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Global exception filter that transforms all exceptions into a standard error response format.
 *
 * Response format:
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human readable message",
 *     "details": {}
 *   },
 *   "meta": {
 *     "timestamp": "2024-01-01T00:00:00.000Z",
 *     "path": "/api/resource"
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Apply globally in main.ts
 * app.useGlobalFilters(new HttpExceptionFilter());
 * ```
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);
    const errorResponse = this.buildErrorResponse(exception, request);

    // Log server errors
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildErrorResponse(exception: unknown, request: Request): ApiErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const errorData = this.parseExceptionResponse(exceptionResponse);

      return {
        success: false,
        error: {
          code: errorData.code || this.getDefaultCode(exception.getStatus()),
          message: errorData.message || exception.message,
          details: errorData.details,
        },
        meta: { timestamp, path },
      };
    }

    // Unknown errors - don't expose internal details
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      meta: { timestamp, path },
    };
  }

  private parseExceptionResponse(response: string | object): ExceptionResponse {
    if (typeof response === 'string') {
      return { message: response };
    }

    const obj = response as ExceptionResponse;
    return {
      code: obj.code,
      message: obj.message,
      details: obj.details,
    };
  }

  private getDefaultCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
    };
    return codeMap[status] || 'ERROR';
  }
}
