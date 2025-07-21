import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatCurrencyCompact as formatCurrencyCompactUtil,
  formatCurrency as formatCurrencyUtil,
  formatDate,
  formatNumber,
} from '../lib/formatters';
import axiosInstance, { authEvents, tenantProfileService } from '../services/api';
import { AuthContext } from './AuthContext'; // ✅ Import the separated context
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('tenant_token'));
  const [user, setUser] = useState(null);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLicenseExpired, setIsLicenseExpired] = useState(false);

  // --- NEW, DEDICATED REFRESH FUNCTION ---
  const refreshTenantProfile = useCallback(async () => {
    try {
      console.log('Refreshing tenant profile...');
      const response = await tenantProfileService.getMyProfile();
      if (response.data.success) {
        setTenantProfile(response.data.data);
      }
    } catch (error) {
      console.error('Could not refresh tenant profile.', error);
      // Optional: handle logout if profile fetch fails
    }
  }, []);

  const loadSession = useCallback(
    async (currentToken) => {
      if (currentToken) {
        try {
          const decodedUser = jwtDecode(currentToken);
          console.log('Decoded User:', decodedUser);
          setUser({
            id: decodedUser.id.id,
            name: decodedUser.id.name,
            companyName: decodedUser.id.companyName,
            email: decodedUser.id.email,
            subdomain: decodedUser.id.subdomain,
            tenantId: decodedUser.id.tenantId,
            role: decodedUser.id.role,
            branchId: decodedUser.id.branchId,
            permissions: decodedUser.id.permissions || [],
            employeeId: decodedUser.id.employeeId || null,
          });

          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
          axiosInstance.defaults.headers.common['X-Tenant-ID'] = decodedUser.id.subdomain;

          localStorage.setItem('tenant_token', currentToken);
          localStorage.setItem('tenant_subdomain', decodedUser.id.subdomain);

          await refreshTenantProfile();

          // const response = await tenantProfileService.getMyProfile();
          // setTenantProfile(response.data.data);
        } catch (error) {
          console.error('Session load failed:', error);
          localStorage.removeItem('tenant_token');
          localStorage.removeItem('tenant_subdomain');
          setToken(null);
          setUser(null);
          setTenantProfile(null);
          delete axiosInstance.defaults.headers.common['Authorization'];
          delete axiosInstance.defaults.headers.common['X-Tenant-ID'];
        }
      }
      setIsLoadingSession(false);
    },
    [refreshTenantProfile],
  );

  useEffect(() => {
    setIsLoadingSession(true);
    loadSession(token);
  }, [token, loadSession]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = useCallback(() => {
    setToken(null);
    setIsLicenseExpired(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => logout();
    const handleLicenseExpired = () => setIsLicenseExpired(true);

    authEvents.addEventListener('logout', handleLogout);
    authEvents.addEventListener('license_expired', handleLicenseExpired);

    return () => {
      authEvents.removeEventListener('logout', handleLogout);
      authEvents.removeEventListener('license_expired', handleLicenseExpired);
    };
  }, [logout]);

  const value = useMemo(() => {
    // --- 2. CREATE THE CONTEXT-AWARE FORMATTING FUNCTION ---

    const formatCurrencyForTenant = (amount) => {
      const currencyCode = tenantProfile?.settings?.localization?.baseCurrency || 'USD';
      return formatCurrencyUtil(amount, currencyCode);
    };

    const formatCurrencyCompactForTenant = (amount, digits = 1) => {
      const currencyCode = tenantProfile?.settings?.localization?.baseCurrency || 'USD';
      return formatCurrencyCompactUtil(amount, currencyCode, digits);
    };

    return {
      token,
      user,
      tenantProfile,
      login,
      logout,
      isLoadingSession,
      isAuthenticated: !!token && !!tenantProfile,
      formatCurrency: formatCurrencyForTenant, // <-- 3. EXPOSE THE FUNCTION
      formatCurrencyCompact: formatCurrencyCompactForTenant, // <-- 3. EXPOSE THE FUNCTION
      refreshTenantProfile,
      formatDate,
      formatNumber,
      isLicenseExpired,
    };
  }, [token, user, tenantProfile, isLoadingSession, refreshTenantProfile, logout, isLicenseExpired]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
