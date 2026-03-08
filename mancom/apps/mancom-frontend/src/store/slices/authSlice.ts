/**
 * Auth Slice
 * Manages authentication state and async operations
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/auth.service';
import { secureStorage } from '../../core/storage/secure-storage';
import type { AuthTokens, User } from '../../types/models';
import type { LoginPayload, SignupPayload } from '../../core/api/types';
import type { RootState } from '../index';

// State interface
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  otpUserId: string | null;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  user: null,
  tokens: null,
  otpUserId: null,
  error: null,
};

// Async Thunks

/**
 * Request OTP for phone number
 */
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await authService.requestOtp({ phone });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      return rejectWithValue(message);
    }
  },
);

/**
 * Verify OTP and complete login flow
 * Calls backend verify-otp endpoint to obtain tokens directly
 */
export const verifyOtpAndLogin = createAsyncThunk(
  'auth/verifyOtpAndLogin',
  async ({ userId, otp }: { userId: string; otp: string }, { rejectWithValue }) => {
    try {
      // Step 1: Verify OTP & Get Session from Backend
      const sessionResponse = await authService.verifyOtp({ userId, secret: otp });

      const { accessToken, refreshToken, expiresAt, user } = sessionResponse.data;

      // Step 2: Save tokens securely
      const tokens: AuthTokens = { accessToken, refreshToken, expiresAt };
      await secureStorage.saveTokens(tokens);

      return { tokens, user: user as User };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify OTP';
      return rejectWithValue(message);
    }
  },
);

/**
 * Restore session on app launch
 * Checks for stored tokens and validates them
 */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { }) => {
    try {
      const tokens = await secureStorage.getTokens();

      if (!tokens) {
        return null;
      }

      // Check if token is expired
      if (Date.now() >= tokens.expiresAt) {
        // Try to refresh
        const response = await authService.refreshToken({
          refreshToken: tokens.refreshToken,
        });

        const newTokens: AuthTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: response.data.expiresAt,
        };

        await secureStorage.saveTokens(newTokens);

        // Get user profile
        const userResponse = await authService.getCurrentUser();

        return { tokens: newTokens, user: userResponse.data };
      }

      // Token still valid, get user profile
      const userResponse = await authService.getCurrentUser();

      return { tokens, user: userResponse.data };
    } catch {
      // Clear invalid tokens
      await secureStorage.clearTokens();
      return null;
    }
  },
);

/**
 * Refresh tokens
 */
export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const currentTokens = state.auth.tokens;

      if (!currentTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken({
        refreshToken: currentTokens.refreshToken,
      });

      const newTokens: AuthTokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
      };

      await secureStorage.saveTokens(newTokens);

      return newTokens;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh token';
      return rejectWithValue(message);
    }
  },
);

/**
 * Logout user
 */
export const logout = createAsyncThunk('auth/logout', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const refreshToken = state.auth.tokens?.refreshToken;

    // Try to revoke session on backend (ignore errors)
    if (refreshToken) {
      try {
        await authService.revokeSession({ refreshToken });
      } catch {
        // Ignore - we'll clear local state anyway
      }
    }

    // Clear stored tokens
    await secureStorage.clearTokens();

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to logout';
    return rejectWithValue(message);
  }
});

/**
 * Login with email/password and role
 */
export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authService.login(payload);
      const { accessToken, refreshToken, expiresAt, user } = response.data;

      const tokens: AuthTokens = { accessToken, refreshToken, expiresAt };
      await secureStorage.saveTokens(tokens);

      return { tokens, user: user as User };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      return rejectWithValue(message);
    }
  },
);

/**
 * Signup with email/password and role
 */
export const signup = createAsyncThunk(
  'auth/signup',
  async (payload: SignupPayload, { rejectWithValue }) => {
    try {
      const response = await authService.signup(payload);
      const { accessToken, refreshToken, expiresAt, user } = response.data;

      const tokens: AuthTokens = { accessToken, refreshToken, expiresAt };
      await secureStorage.saveTokens(tokens);

      return { tokens, user: user as User };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to signup';
      return rejectWithValue(message);
    }
  },
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearOtpUserId: state => {
      state.otpUserId = null;
    },
    setAdminMode: state => {
      if (state.user) {
        state.user.role = 'admin';
      }
    },
    setUserMode: state => {
      if (state.user) {
        state.user.role = 'user';
      }
    },
    setSecurityMode: state => {
      if (state.user) {
        state.user.role = 'security';
      }
    },
    setSuperadminMode: state => {
      if (state.user) {
        state.user.role = 'superadmin';
      }
    },
  },
  extraReducers: builder => {
    // Request OTP
    builder
      .addCase(requestOtp.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpUserId = action.payload.userId || null;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP and Login
    builder
      .addCase(verifyOtpAndLogin.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpAndLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.tokens = action.payload.tokens;
        state.user = action.payload.user;
        state.otpUserId = null;
      })
      .addCase(verifyOtpAndLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.tokens = action.payload.tokens;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Signup
    builder
      .addCase(signup.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.tokens = action.payload.tokens;
        state.user = action.payload.user;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Restore Session
    builder
      .addCase(restoreSession.pending, state => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.isAuthenticated = true;
          state.tokens = action.payload.tokens;
          state.user = action.payload.user;
        }
      })
      .addCase(restoreSession.rejected, state => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
      });

    // Refresh Tokens
    builder
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })
      .addCase(refreshTokens.rejected, state => {
        state.isAuthenticated = false;
        state.tokens = null;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logout.pending, state => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.tokens = null;
        state.user = null;
        state.otpUserId = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearOtpUserId, setAdminMode, setUserMode, setSecurityMode, setSuperadminMode } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectOtpUserId = (state: RootState) => state.auth.otpUserId;

// Reducer
export default authSlice.reducer;
