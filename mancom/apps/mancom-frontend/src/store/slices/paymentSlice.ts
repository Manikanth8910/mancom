import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as paymentService from '../../services/payment.service';
import type { RootState } from '../index';
import { Payment } from '../../services/payment.service';

interface PaymentState {
    payments: Payment[];
    isLoading: boolean;
    error: string | null;
}

export const loadPayments = createAsyncThunk('payment/loadPayments', async (_, { rejectWithValue }) => {
    try {
        const response = await paymentService.fetchPayments();
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to load payments');
    }
});

const paymentSlice = createSlice({
    name: 'payment',
    initialState: { payments: [], isLoading: false, error: null } as PaymentState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loadPayments.pending, (state) => { state.isLoading = true; state.error = null; });
        builder.addCase(loadPayments.fulfilled, (state, action) => {
            state.isLoading = false;
            state.payments = Array.isArray(action.payload) ? action.payload : ((action.payload as any)?.data || []);
        });
        builder.addCase(loadPayments.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
    }
});

export const selectPayments = (state: RootState) => state.payment.payments;
export const selectIsPaymentLoading = (state: RootState) => state.payment.isLoading;
export default paymentSlice.reducer;
