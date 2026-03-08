/**
 * API Endpoints
 * Centralized endpoint definitions for consistency
 */

export const ENDPOINTS = {
  // Auth - Appwrite Proxy
  APPWRITE_PHONE_SESSION: '/auth/appwrite/account/sessions/phone',
  APPWRITE_JWT: '/auth/appwrite/account/jwt',

  // Auth - Our Backend
  REQUEST_OTP: '/auth/otp/request',
  VERIFY_OTP: '/auth/otp/verify',
  EXCHANGE_TOKEN: '/auth/token',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',

  // Features (placeholders)
  VISITORS: '/visitors',
  PAYMENTS: '/payments',
  HELPDESK: '/helpdesk',
  PROFILE: '/profile',
} as const;

export type Endpoint = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];
