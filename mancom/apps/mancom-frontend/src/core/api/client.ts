/**
 * API Client
 * Axios instance with interceptors for auth token injection and refresh
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, HTTP_STATUS } from '../../config/api';
import { secureStorage } from '../storage/secure-storage';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// Request interceptor - inject auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token injection for auth endpoints that don't need it
    const skipAuthEndpoints = [
      '/auth/appwrite/account/sessions/phone',
      '/auth/session/refresh',
    ];

    const shouldSkip = skipAuthEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (!shouldSkip) {
      const tokens = await secureStorage.getTokens();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      // Don't retry refresh token requests
      if (originalRequest.url?.includes('/auth/session/refresh')) {
        // Refresh failed, clear tokens and redirect to login
        await secureStorage.clearTokens();
        // Note: Navigation to login is handled by the auth state listener in the app
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise(resolve => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await secureStorage.getTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await apiClient.post('/auth/session/refresh', {
          refreshToken: tokens.refreshToken,
        });

        const newTokens = response.data.data;
        await secureStorage.saveTokens(newTokens);

        onTokenRefreshed(newTokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        await secureStorage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
