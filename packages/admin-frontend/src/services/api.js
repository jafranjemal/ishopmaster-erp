import axios from "axios";

// The baseURL is now dynamically set from the .env file (for local dev)
// or from the environment variables set on the hosting platform (for production).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Tenant Service
 * A centralized place for all functions interacting with the /tenants endpoint.
 * This abstracts the actual API calls away from the components/hooks.
 */
export const tenantService = {
  getAll: async () => {
    const response = await api.get("/admin/tenants");
    return response.data; // The backend returns { success, count, data }
  },
  create: async (tenantData) => {
    const response = await api.post("/admin/tenants", tenantData);
    return response.data; // The backend returns { success, data }
  },
  delete: async (id) => {
    const response = await api.delete(`/admin/tenants/${id}`);
    return response.data;
  },
  update: async (id, tenantData) => {
    // This function updates general details
    const response = await api.put(`/admin/tenants/${id}`, tenantData);
    return response.data;
  },
  updateModules: async (id, modules) => {
    // This new function updates only the modules
    const response = await api.put(`/admin/tenants/${id}/modules`, { modules });
    return response.data;
  },
};

/**
 * Module Service
 * A centralized place for all functions interacting with the /tenants endpoint.
 * This abstracts the actual API calls away from the components/hooks.
 */
export const adminModuleService = {
  getAll: async () => {
    const response = await api.get("/admin/modules");
    return response.data; // The backend returns { success, count, data }
  },
  create: async (tenantData) => {
    const response = await api.post("/admin/modules", tenantData);
    return response.data; // The backend returns { success, data }
  },
  delete: async (id) => {
    const response = await api.delete(`/admin/modules/${id}`);
    return response.data;
  },
  update: async (id, tenantData) => {
    // This function updates general details
    const response = await api.put(`/admin/modules/${id}`, tenantData);
    return response.data;
  },
  updateModules: async (id, modules) => {
    // This new function updates only the modules
    const response = await api.put(`/admin/modules/${id}/modules`, { modules });
    return response.data;
  },
};

// --- NEW SERVICE FOR ADMIN PERMISSIONS ---
export const adminPermissionService = {
  // READ (All) - Fetches all permissions, grouped by module
  getAll: async () => {
    const response = await api.get("/admin/permissions");
    return response.data; // Expects { success: true, count: number, data: { module: [...] } }
  },
  // CREATE
  create: async (permissionData) => {
    const response = await api.post("/admin/permissions", permissionData);
    return response.data;
  },
  // UPDATE
  update: async (id, permissionData) => {
    const response = await api.put(`/admin/permissions/${id}`, permissionData);
    return response.data;
  },
  // DELETE
  delete: async (id) => {
    const response = await api.delete(`/admin/permissions/${id}`);
    return response.data;
  },
};
