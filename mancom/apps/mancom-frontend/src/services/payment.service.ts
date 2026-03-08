// Dummy Service
import type { ApiResponse } from '../types/models';

export interface Payment {
    id: string;
    amount: number;
    penalty?: number;
    totalAmount: number;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    description: string;
}

export async function fetchPayments(): Promise<ApiResponse<Payment[]>> {
    // Mock API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [],
                meta: { timestamp: new Date().toISOString() }
            });
        }, 500);
    });
}
