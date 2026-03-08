/**
 * User Service
 * API calls for user-related operations
 */

import apiClient from '../core/api/client';
import { ENDPOINTS } from '../core/api/endpoints';
import type { ApiResponse, User } from '../types/models';

/**
 * Get user profile
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>(ENDPOINTS.ME);
  return response.data;
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: Partial<Pick<User, 'name' | 'email'>>,
): Promise<ApiResponse<User>> {
  const response = await apiClient.patch<ApiResponse<User>>(ENDPOINTS.PROFILE, data);
  return response.data;
}

/**
 * Switch active society
 */
export async function switchSociety(societyId: string): Promise<ApiResponse<User>> {
  const response = await apiClient.post<ApiResponse<User>>(`${ENDPOINTS.PROFILE}/society`, {
    societyId,
  });
  return response.data;
}
