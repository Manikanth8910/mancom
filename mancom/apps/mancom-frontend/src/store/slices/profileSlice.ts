import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileService from '../../services/profile.service';
import type { RootState } from '../index';
import { Profile } from '../../services/profile.service';

interface ProfileState {
    profile: Profile | null;
    isLoading: boolean;
    error: string | null;
}

export const loadProfile = createAsyncThunk('profile/loadProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await profileService.fetchProfile();
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to load profile');
    }
});

const profileSlice = createSlice({
    name: 'profile',
    initialState: { profile: null, isLoading: false, error: null } as ProfileState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadProfile.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(loadProfile.fulfilled, (state, action) => {
            state.isLoading = false;
            state.profile = (action.payload as any)?.data || action.payload;
        });
        builder.addCase(loadProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
    }
});

export const selectProfile = (state: RootState) => state.profile.profile;
export const selectIsProfileLoading = (state: RootState) => state.profile.isLoading;
export default profileSlice.reducer;
