/**
 * Auth Service Tests
 */

import * as authService from '../../src/services/auth.service';
import apiClient from '../../src/core/api/client';
import { ENDPOINTS } from '../../src/core/api/endpoints';

// Mock the API client
jest.mock('../../src/core/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('should call the correct endpoint with formatted phone number', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { userId: 'test-user-id' },
          meta: { timestamp: new Date().toISOString() },
        },
      };
      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.requestOtp({ phone: '9876543210' });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        ENDPOINTS.REQUEST_OTP,
        { phone: '9876543210' },
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('verifyOtp', () => {
    it('should call the correct endpoint with userId and secret', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { sessionId: 'session-id' },
          meta: { timestamp: new Date().toISOString() },
        },
      };
      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.verifyOtp({
        userId: 'test-user-id',
        secret: '123456',
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith(ENDPOINTS.VERIFY_OTP, {
        phone: 'test-user-id',
        otp: '123456',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });



  describe('refreshToken', () => {
    it('should refresh tokens using refresh token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            expiresAt: Date.now() + 3600000,
            user: { id: 'user-id', phone: '9876543210', name: 'Test User' },
          },
          meta: { timestamp: new Date().toISOString() },
        },
      };
      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.refreshToken({ refreshToken: 'old-refresh-token' });

      expect(mockedApiClient.post).toHaveBeenCalledWith(ENDPOINTS.REFRESH_TOKEN, {
        refreshToken: 'old-refresh-token',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('revokeSession', () => {
    it('should call the revoke endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
          meta: { timestamp: new Date().toISOString() },
        },
      };
      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.revokeSession({ refreshToken: 'mock-token' });

      expect(mockedApiClient.post).toHaveBeenCalledWith(ENDPOINTS.LOGOUT, { refreshToken: 'mock-token' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', async () => {
      const mockUser = {
        id: 'user-id',
        phone: '9876543210',
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: null,
        societies: [],
        currentSocietyId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockResponse = {
        data: {
          success: true,
          data: mockUser,
          meta: { timestamp: new Date().toISOString() },
        },
      };
      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.getCurrentUser();

      expect(mockedApiClient.get).toHaveBeenCalledWith(ENDPOINTS.ME);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('error handling', () => {
    it('should propagate API errors', async () => {
      const error = new Error('Network error');
      mockedApiClient.post.mockRejectedValueOnce(error);

      await expect(authService.requestOtp({ phone: '9876543210' })).rejects.toThrow('Network error');
    });
  });
});
