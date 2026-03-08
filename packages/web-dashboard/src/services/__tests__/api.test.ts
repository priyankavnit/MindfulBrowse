import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchInsights, ApiError } from '../api';
import { InsightsResponse } from '@mindful-browse/shared';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchInsights', () => {
  const mockAuthToken = 'mock-jwt-token';
  const mockApiUrl = 'https://api.example.com';
  
  const mockInsightsResponse: InsightsResponse = {
    total_time_seconds: 7200,
    sentiment_distribution: {
      positive: 0.35,
      neutral: 0.45,
      negative: 0.20,
    },
    category_distribution: {
      news: 0.30,
      social: 0.25,
      entertainment: 0.20,
      education: 0.15,
      other: 0.10,
    },
    doomscroll_sessions: 2,
  };

  beforeEach(() => {
    // Set environment variable
    import.meta.env.VITE_API_URL = mockApiUrl;
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully fetch insights with valid token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockInsightsResponse,
    });

    const result = await fetchInsights(mockAuthToken);

    expect(mockFetch).toHaveBeenCalledWith(
      `${mockApiUrl}/insights`,
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
          'Content-Type': 'application/json',
        },
      })
    );
    expect(result).toEqual(mockInsightsResponse);
  });

  it('should throw ApiError with isAuthError=true on 401 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    try {
      await fetchInsights(mockAuthToken);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(401);
      expect((error as ApiError).isAuthError).toBe(true);
      expect((error as ApiError).message).toContain('session has expired');
    }
  });

  it('should throw user-friendly ApiError on 500 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    try {
      await fetchInsights(mockAuthToken);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(500);
      expect((error as ApiError).isAuthError).toBe(false);
      expect((error as ApiError).message).toContain('try again later');
    }
  });

  it('should throw ApiError when API URL is not configured', async () => {
    const originalApiUrl = import.meta.env.VITE_API_URL;
    import.meta.env.VITE_API_URL = '';

    try {
      await fetchInsights(mockAuthToken);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(500);
      expect((error as ApiError).message).toContain('not configured');
    } finally {
      import.meta.env.VITE_API_URL = originalApiUrl;
    }
  });

  it('should throw ApiError when auth token is missing', async () => {
    await expect(fetchInsights('')).rejects.toThrow(ApiError);
    
    try {
      await fetchInsights('');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(401);
      expect((error as ApiError).isAuthError).toBe(true);
      expect((error as ApiError).message).toContain('token is missing');
    }
  });

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(fetchInsights(mockAuthToken)).rejects.toThrow(ApiError);
    
    try {
      await fetchInsights(mockAuthToken);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(0);
      expect((error as ApiError).message).toContain('check your internet connection');
    }
  });

  it('should handle other HTTP error codes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    try {
      await fetchInsights(mockAuthToken);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(403);
      expect((error as ApiError).message).toContain('Forbidden');
    }
  });

  it('should handle JSON parsing errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    try {
      await fetchInsights(mockAuthToken);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(500);
      expect((error as ApiError).message).toContain('unexpected error');
    }
  });

  it('should include Authorization header with Bearer token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockInsightsResponse,
    });

    await fetchInsights(mockAuthToken);

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    
    expect(headers['Authorization']).toBe(`Bearer ${mockAuthToken}`);
  });
});
