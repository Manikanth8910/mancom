/**
 * Standard API response wrapper for successful responses.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

/**
 * Standard API response wrapper for error responses.
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ErrorMeta;
}

/**
 * Error details in API error responses.
 */
export interface ApiError {
  /** Machine-readable error code (e.g., 'INVALID_TOKEN') */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Additional error details (validation errors, etc.) */
  details?: Record<string, unknown>;
}

/**
 * Metadata included in successful responses.
 */
export interface ResponseMeta {
  /** ISO timestamp of the response */
  timestamp: string;

  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Metadata included in error responses.
 */
export interface ErrorMeta {
  /** ISO timestamp of the error */
  timestamp: string;

  /** Request path that caused the error */
  path: string;

  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Pagination metadata for list responses.
 */
export interface PaginationMeta {
  /** Total number of items */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNext: boolean;

  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Standard API response with pagination.
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}
