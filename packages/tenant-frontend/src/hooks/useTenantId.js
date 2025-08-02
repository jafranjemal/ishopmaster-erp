const tenantSub = localStorage.getItem('tenant_subdomain');
const tenantUrl = (path) => {
  // Ensures path starts with a slash and doesn't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${tenantSub}${cleanPath}`;
};

export default tenantUrl;
