/**
 * API-specific type definitions
 */

import type { ApiResponse, ApiError } from '../../types/models';

// Request types for auth flow
export interface RequestOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  userId: string;
  secret: string;
}

export interface ExchangeTokenPayload {
  appwriteJwt: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

// Response types
export interface RequestOtpResponse {
  message: string;
  userId?: string;
}

export interface VerifyOtpResponse {
  sessionId: string;
}

export interface AppwriteJwtResponse {
  jwt: string;
}

// Auth Payloads
export interface LoginPayload {
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

export interface SignupPayload {
  email: string;
  password?: string;
  role: 'user' | 'admin';
  name?: string;
  phone?: string;
}

export interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    phone: string;
    email?: string;
    name: string | null;
    role?: 'user' | 'admin';
  };
}

// Generic API result type for thunks
export type ApiResult<T> = ApiResponse<T> | ApiError;

// Type guard to check if response is an error
export function isApiError(response: ApiResult<unknown>): response is ApiError {
  return !response.success;
}
