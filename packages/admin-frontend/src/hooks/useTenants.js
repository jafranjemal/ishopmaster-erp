import { useState, useEffect, useCallback } from 'react';
import { tenantService } from '../services/api';

/**
 * Custom Hook for managing tenant data.
 * Encapsulates all logic for fetching, creating, and state management (loading, errors).
 * Provides a clean interface for UI components to use.
 */
export const useTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tenantService.getAll();
      if (response.success) {
        setTenants(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const addTenant = useCallback(async (tenantData) => {
    try {
      const response = await tenantService.create(tenantData);
      if (response.success) {
        // Update local state instead of refetching for a faster UI response
        setTenants(prev => [...prev, response.data]);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to create tenant.' };
    }
  }, []);

  return { tenants, isLoading, error, addTenant, refetchTenants: fetchTenants };
};
