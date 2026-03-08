/**
 * Auth Slice Tests
 */

import authReducer, {
  clearError,
  clearOtpUserId,
  requestOtp,
  verifyOtpAndLogin,
  logout,
  restoreSession,
} from '../../src/store/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';

// Mock the auth service
jest.mock('../../src/services/auth.service', () => ({
  requestOtp: jest.fn(),
  verifyOtp: jest.fn(),
  getAppwriteJwt: jest.fn(),
  exchangeToken: jest.fn(),
  revokeSession: jest.fn(),
  getCurrentUser: jest.fn(),
  refreshToken: jest.fn(),
}));

// Mock secure storage
jest.mock('../../src/core/storage/secure-storage', () => ({
  secureStorage: {
    saveTokens: jest.fn().mockResolvedValue(true),
    getTokens: jest.fn().mockResolvedValue(null),
    clearTokens: jest.fn().mockResolvedValue(true),
  },
}));

const authService = require('../../src/services/auth.service');
const { secureStorage } = require('../../src/core/storage/secure-storage');

describe('authSlice', () => {
  const createTestStore = () =>
    configureStore({
      reducer: { auth: authReducer },
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = createTestStore();
      const state = store.getState().auth;

      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.otpUserId).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      const store = createTestStore();

      // Set an error first
      store.dispatch({ type: 'auth/requestOtp/rejected', payload: 'Test error' });
      expect(store.getState().auth.error).toBe('Test error');

      // Clear it
      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });

    it('should handle clearOtpUserId', () => {
      const store = createTestStore();

      // Set otpUserId first
      store.dispatch({
        type: 'auth/requestOtp/fulfilled',
        payload: { userId: 'test-user-id' },
      });
      expect(store.getState().auth.otpUserId).toBe('test-user-id');

      // Clear it
      store.dispatch(clearOtpUserId());
      expect(store.getState().auth.otpUserId).toBeNull();
    });
  });

  describe('requestOtp thunk', () => {
    it('should handle successful OTP request', async () => {
      authService.requestOtp.mockResolvedValueOnce({
        data: { userId: 'test-user-id' }
      });

      const store = createTestStore();
      await store.dispatch(requestOtp('9876543210'));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.otpUserId).toBe('test-user-id');
      expect(state.error).toBeNull();
    });

    it('should handle failed OTP request', async () => {
      authService.requestOtp.mockRejectedValueOnce(new Error('Network error'));

      const store = createTestStore();
      await store.dispatch(requestOtp('9876543210'));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.otpUserId).toBeNull();
      expect(state.error).toBe('Network error');
    });

    it('should set loading state while requesting', async () => {
      authService.requestOtp.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100)),
      );

      const store = createTestStore();
      const promise = store.dispatch(requestOtp('9876543210'));

      // Check loading state
      expect(store.getState().auth.isLoading).toBe(true);

      await promise;
    });
  });

  describe('verifyOtpAndLogin thunk', () => {
    it('should handle successful verification and login', async () => {
      authService.verifyOtp.mockResolvedValueOnce({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() + 3600000,
          user: { id: 'user-id', phone: '9876543210', name: 'Test User' },
        },
      });

      const store = createTestStore();
      await store.dispatch(verifyOtpAndLogin({ userId: 'user-id', otp: '123456' }));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.tokens).not.toBeNull();
      expect(state.user).not.toBeNull();
      expect(state.error).toBeNull();
      expect(secureStorage.saveTokens).toHaveBeenCalled();
    });

    it('should handle verification failure', async () => {
      authService.verifyOtp.mockRejectedValueOnce(new Error('Invalid OTP'));

      const store = createTestStore();
      await store.dispatch(verifyOtpAndLogin({ userId: 'user-id', otp: '000000' }));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid OTP');
    });
  });

  describe('logout thunk', () => {
    it('should clear auth state on logout', async () => {
      // First login
      const store = createTestStore();
      store.dispatch({
        type: 'auth/verifyOtpAndLogin/fulfilled',
        payload: {
          tokens: { accessToken: 'token', refreshToken: 'refresh', expiresAt: 0 },
          user: { id: 'user-id', phone: '9876543210', name: null },
        },
      });

      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Then logout
      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.tokens).toBeNull();
      expect(state.user).toBeNull();
      expect(secureStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe('restoreSession thunk', () => {
    it('should restore session when valid tokens exist', async () => {
      const tokens = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000, // Valid for 1 hour
      };
      const user = { id: 'user-id', phone: '9876543210', name: 'Test' };

      secureStorage.getTokens.mockResolvedValueOnce(tokens);
      authService.getCurrentUser.mockResolvedValueOnce({ data: user });

      const store = createTestStore();
      await store.dispatch(restoreSession());

      const state = store.getState().auth;
      expect(state.isInitialized).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.tokens).toEqual(tokens);
    });

    it('should not authenticate when no tokens exist', async () => {
      secureStorage.getTokens.mockResolvedValueOnce(null);

      const store = createTestStore();
      await store.dispatch(restoreSession());

      const state = store.getState().auth;
      expect(state.isInitialized).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
