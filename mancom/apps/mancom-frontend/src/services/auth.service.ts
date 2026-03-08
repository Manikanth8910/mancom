/**
 * Auth Service
 * Pure API calls for authentication - no React or Redux imports
 */

import apiClient from '../core/api/client';
import { ENDPOINTS } from '../core/api/endpoints';
import type {
  RequestOtpPayload,
  VerifyOtpPayload,
  ExchangeTokenPayload,
  RefreshTokenPayload,
  LoginPayload,
  SignupPayload,
  RequestOtpResponse,
  AppwriteJwtResponse,
  SessionResponse,
} from '../core/api/types';
import type { ApiResponse, User } from '../types/models';

/**
 * Login with email and password
 */
export async function login(payload: LoginPayload): Promise<ApiResponse<SessionResponse>> {
  const response = await apiClient.post<ApiResponse<SessionResponse>>(
    ENDPOINTS.LOGIN,
    payload,
  );
  return response.data;
}

/**
 * Signup with email and password
 */
export async function signup(payload: SignupPayload): Promise<ApiResponse<SessionResponse>> {
  const response = await apiClient.post<ApiResponse<SessionResponse>>(
    ENDPOINTS.SIGNUP,
    payload,
  );
  return response.data;
}

/**
 * Request OTP for phone number
 */
export async function requestOtp(payload: RequestOtpPayload): Promise<ApiResponse<RequestOtpResponse>> {
  const response = await apiClient.post<ApiResponse<RequestOtpResponse>>(
    ENDPOINTS.REQUEST_OTP,
    payload,
  );
  return response.data;
}

/**
 * Verify OTP and get session tokens immediately from our backend
 */
export async function verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<SessionResponse>> {
  const response = await apiClient.post<ApiResponse<SessionResponse>>(
    ENDPOINTS.VERIFY_OTP,
    { phone: payload.userId, otp: payload.secret }, // mapping frontend payload format to backend schema (phone, otp)
  );
  return response.data;
}

/**
 * Get Appwrite JWT from session
 * MOCKED
 */
export async function getAppwriteJwt(): Promise<ApiResponse<AppwriteJwtResponse>> {
  return {
    success: true,
    data: { jwt: 'mock.appwrite.jwt' },
    meta: { timestamp: new Date().toISOString() }
  };
}

/**
 * Exchange Appwrite JWT for our backend tokens
 * This is the final step in the auth flow
 */
export async function exchangeToken(payload: ExchangeTokenPayload): Promise<ApiResponse<SessionResponse>> {
  const response = await apiClient.post<ApiResponse<SessionResponse>>(
    ENDPOINTS.EXCHANGE_TOKEN,
    payload,
  );
  return response.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(payload: RefreshTokenPayload): Promise<ApiResponse<SessionResponse>> {
  const response = await apiClient.post<ApiResponse<SessionResponse>>(
    ENDPOINTS.REFRESH_TOKEN,
    payload,
  );
  return response.data;
}

/**
 * Revoke current session (logout)
 */
export async function revokeSession(payload: { refreshToken: string }): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
    ENDPOINTS.LOGOUT,
    payload,
  );
  return response.data;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>(ENDPOINTS.ME);
  return response.data;
}
