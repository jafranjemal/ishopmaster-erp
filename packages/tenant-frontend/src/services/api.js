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

// For tenant-specific role management
export const tenantRoleService = {
  getAll: async () => api.get("/tenant/roles"),
  create: async (data) => api.post("/tenant/roles", data),
  update: async (id, data) => api.put(`/tenant/roles/${id}`, data),
  delete: async (id) => api.delete(`/tenant/roles/${id}`),
};

// For fetching the master list of all possible permissions
export const adminPermissionService = {
  getAll: async () => api.get("/admin/permissions"),
};

export const tenantAuthService = {
  /**
   * Logs a user into a specific tenant account.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @param {string} subdomain - The tenant's unique subdomain, used for identification.
   * @returns {Promise<object>} The full axios response object.
   */
  login: async (email, password, subdomain) => {
    // Make a POST request to the tenant login endpoint.
    // We pass the subdomain in the `config` object as a custom header.
    // The `tenantResolver` middleware on our backend will use this header.
    const response = await api.post(
      "/tenant/auth/login", // The URL path
      { email, password }, // The request body
      {
        headers: {
          "X-Tenant-ID": subdomain, // The crucial header for identifying the tenant
        },
      }
    );
    return response;
  },
};

export const tenantDashboardService = {
  /**
   * Fetches the summary data for the main dashboard.
   * NOTE: This currently returns mock data. In a real implementation,
   * this would make a GET request to an endpoint like '/tenant/dashboard/summary'.
   */
  getSummary: async () => {
    console.log("Fetching dashboard summary (mocked)...");
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // The structure a real API would return
    const mockData = {
      todaySales: 1450.75,
      pendingRepairs: 8,
      lowStockItems: 3,
      newCustomersToday: 5,
      salesLast7Days: [
        { date: "Jun 13", sales: 1200 },
        { date: "Jun 14", sales: 1500 },
        { date: "Jun 15", sales: 1100 },
        { date: "Jun 16", sales: 1800 },
        { date: "Jun 17", sales: 1600 },
        { date: "Jun 18", sales: 1950 },
        { date: "Jun 19", sales: 1450.75 },
      ],
      recentActivity: [
        {
          id: 1,
          type: "SALE",
          description: "Invoice INV-0084 created",
          time: "5m ago",
          user: "Jane Doe",
        },
        {
          id: 2,
          type: "REPAIR",
          description: 'Ticket #REP-015 marked as "Completed"',
          time: "15m ago",
          user: "John Smith",
        },
        {
          id: 3,
          type: "INVENTORY",
          description: '10 units of "Screen Protector" added',
          time: "45m ago",
          user: "Jane Doe",
        },
        {
          id: 4,
          type: "CUSTOMER",
          description: 'New customer "Alice" registered',
          time: "1h ago",
          user: "Jane Doe",
        },
      ],
    };

    return { data: { success: true, data: mockData } };
  },
};

export const tenantLocationService = {
  // --- Branch Methods ---
  getAllBranches: async () => api.get("/tenant/locations/branches"),
  createBranch: async (data) => api.post("/tenant/locations/branches", data),
  updateBranch: async (id, data) =>
    api.put(`/tenant/locations/branches/${id}`, data),
  deleteBranch: async (id) => api.delete(`/tenant/locations/branches/${id}`),

  // --- Warehouse Methods ---
  getAllWarehouses: async () => api.get("/tenant/locations/warehouses"),
  createWarehouse: async (data) =>
    api.post("/tenant/locations/warehouses", data),
  updateWarehouse: async (id, data) =>
    api.put(`/tenant/locations/warehouses/${id}`, data),
  deleteWarehouse: async (id) =>
    api.delete(`/tenant/locations/warehouses/${id}`),
};

export const tenantUserService = {
  getAll: async () => api.get("/tenant/users"),
  create: async (userData) => api.post("/tenant/users", userData),
  update: async (id, userData) => api.put(`/tenant/users/${id}`, userData),
  delete: async (id) => api.delete(`/tenant/users/${id}`), // This is the deactivate route
};

// --- NEW ACCOUNTING SERVICE ---
export const tenantAccountingService = {
  /**
   * Fetches all accounts in the tenant's Chart of Accounts.
   */
  getAllAccounts: async () => {
    return api.get("/tenant/accounting/accounts");
  },

  /**
   * Creates a new account in the Chart of Accounts.
   * @param {object} accountData - The data for the new account.
   */
  createAccount: async (accountData) => {
    return api.post("/tenant/accounting/accounts", accountData);
  },

  /**
   * Updates an existing account.
   * @param {string} id - The ID of the account to update.
   * @param {object} accountData - The updated data.
   */
  updateAccount: async (id, accountData) => {
    return api.put(`/tenant/accounting/accounts/${id}`, accountData);
  },

  /**
   * Deletes an account.
   * @param {string} id - The ID of the account to delete.
   */
  deleteAccount: async (id) => {
    return api.delete(`/tenant/accounting/accounts/${id}`);
  },

  /**
   * Fetches ledger entries with pagination and filtering.
   * @param {object} params - The query parameters for filtering and pagination.
   * @param {number} params.page - The current page number.
   * @param {number} params.limit - The number of items per page.
   * @param {string} [params.startDate] - The start date for filtering (ISO format).
   * @param {string} [params.endDate] - The end date for filtering (ISO format).
   */
  getLedgerEntries: async (params) => {
    return api.get("/tenant/accounting/ledger", { params });
  },
};

// --- NEW CUSTOMER (CRM) SERVICE ---
export const tenantCustomerService = {
  getAll: async () => api.get("/tenant/crm/customers"),
  getById: async (id) => api.get(`/tenant/crm/customers/${id}`),
  create: async (data) => api.post("/tenant/crm/customers", data),
  update: async (id, data) => api.put(`/tenant/crm/customers/${id}`, data),
  delete: async (id) => api.delete(`/tenant/crm/customers/${id}`),
  /**
   * Fetches the paginated financial ledger for a single customer.
   * @param {string} customerId - The ID of the customer.
   * @param {object} params - The query parameters for pagination (e.g., { page, limit }).
   * @returns {Promise<object>} The API response with ledger entries and pagination info.
   */
  getCustomerLedger: async (customerId, params) => {
    return api.get(`/tenant/crm/customers/${customerId}/ledger`, { params });
  },
};

// --- NEW SUPPLIER (PROCUREMENT) SERVICE ---
export const tenantSupplierService = {
  getAll: async () => api.get("/tenant/procurement/suppliers"),
  getById: async (id) => api.get(`/tenant/procurement/suppliers/${id}`),
  create: async (data) => api.post("/tenant/procurement/suppliers", data),
  update: async (id, data) =>
    api.put(`/tenant/procurement/suppliers/${id}`, data),
  delete: async (id) => api.delete(`/tenant/procurement/suppliers/${id}`),
  getSupplierLedger: async (id, params) => {
    return api.get(`/tenant/procurement/suppliers/${id}/ledger`, { params });
  },
};

export const tenantProfileService = {
  getMyProfile: async () => api.get("/tenant/profile"),
  updateMyProfile: async (data) => api.put("/tenant/profile", data), // For company info
  updateLocalization: async (data) =>
    api.put("/tenant/profile/localization", data), // <-- NEW
};

// --- NEW METADATA SERVICES ---
export const tenantBrandService = {
  getAll: async () => api.get("/tenant/inventory/brands"),
  create: async (data) => api.post("/tenant/inventory/brands", data),
  update: async (id, data) => api.put(`/tenant/inventory/brands/${id}`, data),
  delete: async (id) => api.delete(`/tenant/inventory/brands/${id}`),
};

export const tenantCategoryService = {
  getAll: async () => api.get("/tenant/inventory/categories"),
  create: async (data) => api.post("/tenant/inventory/categories", data),
  update: async (id, data) =>
    api.put(`/tenant/inventory/categories/${id}`, data),
  delete: async (id) => api.delete(`/tenant/inventory/categories/${id}`),
};

export const tenantAttributeService = {
  // Methods for individual Attributes
  getAllAttributes: async () => api.get("/tenant/attributes"),
  createAttribute: async (data) => api.post("/tenant/attributes", data),
  updateAttribute: async (id, data) =>
    api.put(`/tenant/attributes/${id}`, data),
  deleteAttribute: async (id) => api.delete(`/tenant/attributes/${id}`),
  // Methods for Attribute Sets
  getAllAttributeSets: async () => api.get("/tenant/attributes/sets"),
  createAttributeSet: async (data) => api.post("/tenant/attributes/sets", data),
  updateAttributeSet: async (id, data) =>
    api.put(`/tenant/attributes/sets/${id}`, data),
  deleteAttributeSet: async (id) => api.delete(`/tenant/attributes/sets/${id}`),
};

export default api;
