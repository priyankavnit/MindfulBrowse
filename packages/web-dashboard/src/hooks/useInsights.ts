import { useState, useEffect, useCallback } from 'react';
import { InsightsResponse } from '@mindful-browse/shared';
import { useAuth } from '../contexts/AuthContext';
import { fetchInsights, ApiError } from '../services/api';

interface UseInsightsResult {
  insights: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing insights data
 * 
 * Automatically fetches insights on mount and handles authentication errors
 * by redirecting to login when a 401 response is received.
 * 
 * Features:
 * - Auto-refresh every 60 seconds
 * - Manual refresh via refetch function
 * - Last refresh timestamp tracking
 * 
 * @returns Object containing insights data, loading state, error message, last refresh time, and refetch function
 * 
 * Requirements: 7.1, 7.2, 8.5, 8.6, 9.5
 */
export function useInsights(): UseInsightsResult {
  const { authToken, login } = useAuth();
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!authToken) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchInsights(authToken);
      setInsights(data);
      setLastRefresh(new Date());
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle authentication errors by redirecting to login
        if (err.isAuthError) {
          console.error('Authentication error, redirecting to login:', err.message);
          // Redirect to login page
          await login();
          return;
        }
        
        // Set user-friendly error message
        setError(err.message);
      } else {
        // Handle unexpected errors
        setError('An unexpected error occurred. Please try again.');
      }
      
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  }, [authToken, login]);

  // Fetch insights on mount and when authToken changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return {
    insights,
    loading,
    error,
    lastRefresh,
    refetch: fetchData,
  };
}
