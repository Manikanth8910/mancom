import type { ApiResponse } from '../types/models';

export interface Ticket {
    id: string;
    title: string;
    status: 'open' | 'in-progress' | 'resolved';
    date: string;
}

export async function fetchTickets(): Promise<ApiResponse<Ticket[]>> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    { id: '101', title: 'Plumbing issue in kitchen', status: 'open', date: '2026-03-01' },
                    { id: '102', title: 'AC Filter cleaning', status: 'resolved', date: '2026-02-15' },
                    { id: '103', title: 'Broken gym equipment', status: 'in-progress', date: '2026-02-28' },
                ],
                meta: { timestamp: new Date().toISOString() }
            });
        }, 500);
    });
}
