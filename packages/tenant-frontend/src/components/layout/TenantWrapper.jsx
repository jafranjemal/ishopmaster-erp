import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { TenantProvider } from '../../context/TenantContext';
import { setApiTenantHeader } from '../../services/api'; // Assuming you export this from api.js

/**
 * A "smart" wrapper component that acts as the gatekeeper for all tenant-aware routes.
 * It extracts the tenantId from the URL path, configures the API service,
 * and provides the TenantContext to all nested components.
 */
const TenantWrapper = () => {
  const { tenantId } = useParams();

  useEffect(() => {
    // This effect runs whenever the tenantId in the URL changes.
    if (tenantId) {
      setApiTenantHeader(tenantId);
    }
    // Cleanup function to clear the header if the user navigates away
    return () => {
      setApiTenantHeader(null);
    };
  }, [tenantId]);

  return (
    <TenantProvider tenantId={tenantId}>
      <Outlet /> {/* This renders the matched child route (e.g., DashboardPage) */}
    </TenantProvider>
  );
};

export default TenantWrapper;
