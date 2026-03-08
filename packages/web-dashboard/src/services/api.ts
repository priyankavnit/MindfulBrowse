import { InsightsResponse } from '@mindful-browse/shared';

/**
 * API client for fetching insights from the backend
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isAuthError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetches browsing insights from the backend API
 * 
 * @param authToken - JWT authentication token from Cognito
 * @returns Promise resolving to InsightsResponse
 * @throws ApiError with appropriate status code and message
 * 
 * Requirements: 7.1, 7.2, 9.5
 */
export async function fetchInsights(authToken: string): Promise<InsightsResponse> {
  if (!API_URL) {
    throw new ApiError(
      'API URL is not configured. Please check your environment variables.',
      500
    );
  }

  if (!authToken) {
    throw new ApiError(
      'Authentication token is missing.',
      401,
      true
    );
  }

  try {
    const response = await fetch(`${API_URL}/insights`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle authentication errors (401 Unauthorized)
    if (response.status === 401) {
      throw new ApiError(
        'Your session has expired. Please log in again.',
        401,
        true
      );
    }

    // Handle server errors (500 Internal Server Error)
    if (response.status === 500) {
      throw new ApiError(
        'We encountered an issue loading your insights. Please try again later.',
        500
      );
    }

    // Handle other error status codes
    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch insights: ${response.statusText}`,
        response.status
      );
    }

    // Parse and return the insights data
    const data: InsightsResponse = await response.json();
    return data;
  } catch (error) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors or other fetch failures
    if (error instanceof TypeError) {
      throw new ApiError(
        'Unable to connect to the server. Please check your internet connection.',
        0
      );
    }

    // Handle unexpected errors
    throw new ApiError(
      'An unexpected error occurred while fetching insights.',
      500
    );
  }
}
