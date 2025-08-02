/**
 * Ensures the URL path starts with the correct tenant subdomain from localStorage.
 * If the path is incorrect, it prepends the tenant subdomain and redirects.
 */
const ensureTenantInPath = (currentPath) => {
  // 1. Get required data
  const storedTenant = localStorage.getItem('tenant_subdomain'); // Your localStorage key

  // If there's no tenant stored, we can't do anything.
  // You might want to redirect to a login or tenant selection page here.
  if (!storedTenant) {
    console.warn('No tenant subdomain found in localStorage.');
    return;
  }

  // Optional: Define public routes that should NOT be prefixed
  const publicRoutes = ['/login', '/logout', '/select-tenant'];
  if (publicRoutes.some((route) => currentPath.startsWith(route))) {
    return; // Do nothing for public routes
  }

  // 2. Split the path and get the first segment
  // Using .filter(Boolean) removes any empty strings from the split
  const pathSegments = currentPath.split('/').filter(Boolean);
  const firstPathSegment = pathSegments[0];

  // 3. Check if the first path segment matches the stored tenant
  if (firstPathSegment !== storedTenant) {
    console.log('Path mismatch detected. Redirecting...');

    // 4. Construct the new URL and redirect
    // This prepends the correct tenant to the current path.
    // e.g., if path is '/dashboard' it becomes '/tenant-name/dashboard'
    const newPath = `/${storedTenant}${currentPath}`;

    // Use replace() so the incorrect URL isn't added to browser history
    window.location.replace(newPath);
  }
};

export default ensureTenantInPath;
