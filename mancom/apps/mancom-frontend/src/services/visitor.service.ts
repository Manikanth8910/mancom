import { apiClient } from '../core/api/client';
import { ENDPOINTS } from '../core/api/endpoints';
import type { ApiResponse } from '../types/models';

export interface Visitor {
    id: string;
    name: string;
    purpose: string;
    phone?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export async function fetchVisitors(): Promise<ApiResponse<Visitor[]>> {
    const response = await apiClient.get(ENDPOINTS.VISITORS);
    return response.data;
}

export async function createVisitor(data: { name: string; purpose: string; phone?: string }): Promise<ApiResponse<Visitor>> {
    const response = await apiClient.post(ENDPOINTS.VISITORS, data);
    return response.data;
}
