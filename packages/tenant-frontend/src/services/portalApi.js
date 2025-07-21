import axios from 'axios'; // Portal might use a separate axios instance
import { jwtDecode } from 'jwt-decode';
//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1/portal';
const API_URL = 'http://localhost:5001/api/v1/public/portal';
const portalApi = axios.create({ baseURL: API_URL });
// This function runs before every single request sent by this portalApi instance.
portalApi.interceptors.request.use(
  (config) => {
    // 1. Get the session token from local storage.
    const sessionToken = localStorage.getItem('customerToken');

    if (sessionToken) {
      try {
        // 2. Decode the token to read the tenantId from its payload.
        const decodedToken = jwtDecode(sessionToken);
        const tenantId = decodedToken.tenantId;

        if (tenantId) {
          // 3. Automatically add the X-Tenant-ID header to the request.
          config.headers['X-Tenant-ID'] = tenantId;
        }
      } catch (error) {
        console.error('Failed to decode customer token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Sets the X-Tenant-ID header for all subsequent requests made by this portalApi instance.
 * This should be called once when the portal application initializes.
 * @param {string} tenantId - The subdomain or identifier for the tenant.
 */
export const setTenantForPortalApi = (tenantId) => {
  if (tenantId) {
    portalApi.defaults.headers.common['X-Tenant-ID'] = tenantId;
  } else {
    // Clear the header if the tenant is unknown to prevent sending a stale header
    delete portalApi.defaults.headers.common['X-Tenant-ID'];
  }
};

export const portalAuthService = {
  validateToken: (token) => portalApi.post('/auth/validate-token', { token }),
  requestLoginLink: (token) => portalApi.post('/auth/request-login-link', { token }),
  requestNewLink: (data) => portalApi.post('/auth/resend-link', data),
  trackRepair: (ticketId) => portalApi.get(`/repair/${ticketId}`),
  generatePortalToken: (customerId) => portalApi.post(`/crm/customers/${customerId}/generate-portal-token`),
  getQuoteDetails: (quoteId) => {
    return portalApi.get(`/quotes/${quoteId}`);
  },
  approveQuote: (quoteId, signature) => {
    return portalApi.post(`/quotes/${quoteId}/approve`, { signature });
  },
  getTenantProfile: () => portalApi.get('/tenant-profile'),
};
