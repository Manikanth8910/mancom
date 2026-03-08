/**
 * API configuration constants
 */

import { Platform } from 'react-native';

export const API_CONFIG = {
  BASE_URL: __DEV__
    ? Platform.OS === 'android'
      ? 'http://10.0.2.2:3001'
      : 'http://192.168.0.133:3001'
    : 'https://api.mancom.app',
  PARKING_URL: __DEV__
    ? Platform.OS === 'android'
      ? 'http://10.0.2.2:3005'
      : 'http://localhost:3005'
    : 'https://parking.mancom.app',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
