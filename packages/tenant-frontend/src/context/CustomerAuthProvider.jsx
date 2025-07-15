import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { tenantCustomerService } from '../services/api'; // Assuming this service can be used

// 1. Create the context
const CustomerAuthContext = createContext(null);

/**
 * This is the definitive Auth Provider for the entire customer portal.
 * It manages the customer's session state, persists the token, and provides
 * auth functions to all child components.
 */
export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('customerToken'));
  const [isLoading, setIsLoading] = useState(true);

  /**
   * This effect runs on initial application load.
   * Its job is to check for an existing token in local storage and,
   * if found, verify it and fetch the customer's data to establish a session.
   */
  const verifyExistingToken = useCallback(async () => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check if the token is expired client-side first for a quick exit
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('customerToken');
          setToken(null);
          setCustomer(null);
          setIsLoading(false);
          return;
        }

        // In a production app, you would have a dedicated /api/portal/me endpoint
        // that re-validates the token server-side and returns fresh user data.
        // For now, we'll fetch the customer data using their ID from the token.
        const customerRes = await tenantCustomerService.getById(decoded.id);
        setCustomer(customerRes.data.data);
      } catch (error) {
        console.error('Invalid token found, clearing session.', error);
        localStorage.removeItem('customerToken');
        setToken(null);
        setCustomer(null);
      }
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    verifyExistingToken();
  }, [verifyExistingToken]);

  /**
   * Logs a customer in by storing their JWT and setting their data.
   * This is called by the PortalLoginPage after a successful magic link validation.
   */
  const login = (sessionToken, customerData) => {
    localStorage.setItem('customerToken', sessionToken);
    console.log('sessionToken in login', sessionToken);
    console.log('customerData in login', customerData);
    setToken(sessionToken);
    setCustomer(customerData);
  };

  /**
   * Logs the customer out by clearing the token and user data from state and local storage.
   */
  const logout = () => {
    localStorage.removeItem('customerToken');
    setToken(null);
    setCustomer(null);
  };

  // The value provided to all consuming components
  const value = {
    customer,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  // We don't render the rest of the app until we've checked for an existing token.
  // This prevents UI flicker or showing a login page to an already-logged-in user.
  return <CustomerAuthContext.Provider value={value}>{!isLoading && children}</CustomerAuthContext.Provider>;
};

/**
 * The definitive custom hook for accessing the customer's authentication state.
 * Any component within the portal can use this to get the customer's data or logout function.
 */
export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
