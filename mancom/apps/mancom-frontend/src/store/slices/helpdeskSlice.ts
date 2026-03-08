import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as helpdeskService from '../../services/helpdesk.service';
import type { RootState } from '../index';
import { Ticket } from '../../services/helpdesk.service';

interface HelpdeskState {
    tickets: Ticket[];
    isLoading: boolean;
    error: string | null;
}

export const loadTickets = createAsyncThunk('helpdesk/loadTickets', async (_, { rejectWithValue }) => {
    try {
        const response = await helpdeskService.fetchTickets();
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to load tickets');
    }
});

const helpdeskSlice = createSlice({
    name: 'helpdesk',
    initialState: { tickets: [], isLoading: false, error: null } as HelpdeskState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadTickets.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(loadTickets.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tickets = Array.isArray(action.payload) ? action.payload : ((action.payload as any)?.data || []);
        });
        builder.addCase(loadTickets.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
    }
});

export const selectTickets = (state: RootState) => state.helpdesk.tickets;
export const selectIsHelpdeskLoading = (state: RootState) => state.helpdesk.isLoading;
export default helpdeskSlice.reducer;
