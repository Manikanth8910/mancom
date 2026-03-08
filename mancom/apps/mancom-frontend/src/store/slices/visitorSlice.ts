import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as visitorService from '../../services/visitor.service';
import type { RootState } from '../index';
import { Visitor } from '../../services/visitor.service';

interface VisitorState {
    visitors: Visitor[];
    isLoading: boolean;
    error: string | null;
}

const initialState: VisitorState = {
    visitors: [],
    isLoading: false,
    error: null,
};

export const loadVisitors = createAsyncThunk('visitor/loadVisitors', async (_, { rejectWithValue }) => {
    try {
        const response = await visitorService.fetchVisitors();
        return response.data; // Now returns the actual payload! Wait, if the payload format is ApiResponse<T>, response itself might be the ApiResponse? No wait, axios returns { data: ApiResponse } which we extract out. In service we returned response.data. But wait, what if the nest backend returns just the array? Actually nest returns array from controller! Because we didn't use TransformInterceptor in our manual controller. Wait! I registered TransformInterceptor globally in main.ts! So backend returns `{ success: true, data: [...], meta: {...} }`.
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to load visitors');
    }
});

export const addVisitor = createAsyncThunk('visitor/addVisitor', async (visitor: { name: string; purpose: string; phone?: string }, { rejectWithValue }) => {
    try {
        const response = await visitorService.createVisitor(visitor);
        return response.data; // response is ApiResponse<Visitor>, so response.data is Visitor.
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to add visitor');
    }
});

const visitorSlice = createSlice({
    name: 'visitor',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadVisitors.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loadVisitors.fulfilled, (state, action) => {
            state.isLoading = false;
            // The transform interceptor wraps the resใน `data`
            state.visitors = Array.isArray(action.payload) ? action.payload : ((action.payload as any)?.data || []);
        });
        builder.addCase(loadVisitors.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        builder.addCase(addVisitor.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(addVisitor.fulfilled, (state, action) => {
            state.isLoading = false;
            const newVisitor = (action.payload as any)?.data || action.payload;
            state.visitors.push(newVisitor);
        });
        builder.addCase(addVisitor.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    }
});

export const selectVisitors = (state: RootState) => state.visitor.visitors;
export const selectIsVisitorLoading = (state: RootState) => state.visitor.isLoading;
export const selectVisitorError = (state: RootState) => state.visitor.error;

export default visitorSlice.reducer;
