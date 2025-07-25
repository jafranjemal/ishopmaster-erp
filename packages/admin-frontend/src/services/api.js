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

export const adminTenantService = {
  /**
   * Fetches all tenants with filtering and pagination.
   * @param {object} params - { page, limit, isActive, searchTerm }
   */
  getAll: async (params) => {
    return api.get("/admin/tenants", { params });
  },

  /**
   * Updates a tenant's details (license, active status).
   * @param {string} id - The ID of the tenant to update.
   * @param {object} data - The data to update.
   */
  update: async (id, data) => {
    return api.put(`/admin/tenants/${id}`, data);
  },
};

export const adminBackupService = {
  /**
   * Fetches all backup records for all tenants, with filtering and pagination.
   * @param {object} params - { page, limit, tenantId }
   */
  getAllBackups: async (params) => {
    return api.get("/admin/backups", { params });
  },
  triggerManualBackup: async (tenantId) => {
    return api.post("/admin/backups/trigger", { tenantId });
  },

  /**
   * Triggers the restore process for a specific backup record.
   * @param {string} backupRecordId - The ID of the backup record to restore.
   */
  restoreBackup: async (backupRecordId) => {
    return api.post(`/admin/backups/${backupRecordId}/restore`);
  },
};
