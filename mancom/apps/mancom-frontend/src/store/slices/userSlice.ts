/**
 * User Slice
 * Manages user profile and society state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../services/user.service';
import type { User, UserSociety } from '../../types/models';
import type { RootState } from '../index';

// State interface
interface UserState {
  profile: User | null;
  currentSociety: UserSociety | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  profile: null,
  currentSociety: null,
  isLoading: false,
  error: null,
};

// Async Thunks

/**
 * Fetch user profile
 */
export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      return rejectWithValue(message);
    }
  },
);

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: Partial<Pick<User, 'name' | 'email'>>, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      return rejectWithValue(message);
    }
  },
);

/**
 * Switch active society
 */
export const switchSociety = createAsyncThunk(
  'user/switchSociety',
  async (societyId: string, { rejectWithValue }) => {
    try {
      const response = await userService.switchSociety(societyId);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to switch society';
      return rejectWithValue(message);
    }
  },
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: state => {
      state.error = null;
    },
    setCurrentSociety: (state, action) => {
      state.currentSociety = action.payload;
    },
    clearUserState: state => {
      state.profile = null;
      state.currentSociety = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        // Set current society from profile
        if (action.payload.currentSocietyId && action.payload.societies) {
          state.currentSociety =
            action.payload.societies.find(s => s.id === action.payload.currentSocietyId) || null;
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Switch Society
    builder
      .addCase(switchSociety.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(switchSociety.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        if (action.payload.currentSocietyId && action.payload.societies) {
          state.currentSociety =
            action.payload.societies.find(s => s.id === action.payload.currentSocietyId) || null;
        }
      })
      .addCase(switchSociety.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearUserError, setCurrentSociety, clearUserState } = userSlice.actions;

// Selectors
export const selectProfile = (state: RootState) => state.user.profile;
export const selectCurrentSociety = (state: RootState) => state.user.currentSociety;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;

// Reducer
export default userSlice.reducer;
