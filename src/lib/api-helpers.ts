import type { ApiResponse } from '@/types/api';

/**
 * Helper to extract data from API response
 * Throws error if response is not successful
 */
export function extractApiData<T>(response: ApiResponse<T>): T {
  if (!response.success || !response.data) {
    throw new Error(response.error || response.detail || 'Request failed');
  }
  return response.data;
}

/**
 * Helper to check if API response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

/**
 * Helper to safely get error message from API response
 */
export function getApiErrorMessage(response: ApiResponse<unknown>): string {
  return response.error || response.detail || 'An error occurred';
}
