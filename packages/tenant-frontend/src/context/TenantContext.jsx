import { createContext, useContext, useMemo } from 'react';

const TenantContext = createContext(null);

/**
 * Provides the tenant context to its children.
 * The value is provided by the TenantWrapper component.
 */
export const TenantProvider = ({ children, tenantId }) => {
  const value = useMemo(() => {
    const tenantUrl = (path) => {
      // Ensures path starts with a slash and doesn't have double slashes
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `/${tenantId}${cleanPath}`;
    };
    return { tenantId, tenantUrl };
  }, [tenantId]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

/**
 * The definitive hook for accessing tenant context (the "You Are Here" map).
 * Provides the current tenantId and a tenantUrl() helper function.
 */
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
