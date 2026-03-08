import type { ApiResponse } from '../types/models';

export interface Profile {
    id: string;
    name: string;
    email: string;
    flatId: string;
    societyName: string;
}

export async function fetchProfile(): Promise<ApiResponse<Profile>> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {
                    id: 'user_001',
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                    flatId: 'A-101',
                    societyName: 'Mancom Paradise VIP'
                },
                meta: { timestamp: new Date().toISOString() }
            });
        }, 500);
    });
}
