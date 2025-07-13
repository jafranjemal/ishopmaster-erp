import axios from 'axios';
import toast from 'react-hot-toast';

// The baseURL is now dynamically set from the .env file (for local dev)
// or from the environment variables set on the hosting platform (for production).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// We need a way to communicate this back to the context. An event emitter is a clean way.
export const authEvents = new EventTarget();
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Standard session expiry
      if (error.response.status === 401) {
        if (window.location.pathname !== '/login') {
          toast.error('Your session has expired. Please log in again.');
          authEvents.dispatchEvent(new Event('logout'));
        }
      }
      // --- NEW LOGIC ---
      // Specific license expiry error
      else if (error.response.status === 403 && error.response.data?.error === 'LICENSE_EXPIRED') {
        // Fire a custom event that our AuthContext will listen for
        authEvents.dispatchEvent(new Event('license_expired'));
        // We still reject the promise so the original component knows the API call failed
      }
      // --- END OF NEW LOGIC ---
    }
    return Promise.reject(error);
  },
);

// For tenant-specific role management
export const tenantRoleService = {
  getAll: async () => api.get('/tenant/roles'),
  create: async (data) => api.post('/tenant/roles', data),
  update: async (id, data) => api.put(`/tenant/roles/${id}`, data),
  delete: async (id) => api.delete(`/tenant/roles/${id}`),
};

// For fetching the master list of all possible permissions
export const adminPermissionService = {
  getAll: async () => api.get('/admin/permissions'),
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
      '/tenant/auth/login', // The URL path
      { email, password }, // The request body
      {
        headers: {
          'X-Tenant-ID': subdomain, // The crucial header for identifying the tenant
        },
      },
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
    console.log('Fetching dashboard summary (mocked)...');
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // The structure a real API would return
    const mockData = {
      todaySales: 1450.75,
      pendingRepairs: 8,
      lowStockItems: 3,
      newCustomersToday: 5,
      salesLast7Days: [
        { date: 'Jun 13', sales: 1200 },
        { date: 'Jun 14', sales: 1500 },
        { date: 'Jun 15', sales: 1100 },
        { date: 'Jun 16', sales: 1800 },
        { date: 'Jun 17', sales: 1600 },
        { date: 'Jun 18', sales: 1950 },
        { date: 'Jun 19', sales: 1450.75 },
      ],
      recentActivity: [
        {
          id: 1,
          type: 'SALE',
          description: 'Invoice INV-0084 created',
          time: '5m ago',
          user: 'Jane Doe',
        },
        {
          id: 2,
          type: 'REPAIR',
          description: 'Ticket #REP-015 marked as "Completed"',
          time: '15m ago',
          user: 'John Smith',
        },
        {
          id: 3,
          type: 'INVENTORY',
          description: '10 units of "Screen Protector" added',
          time: '45m ago',
          user: 'Jane Doe',
        },
        {
          id: 4,
          type: 'CUSTOMER',
          description: 'New customer "Alice" registered',
          time: '1h ago',
          user: 'Jane Doe',
        },
      ],
    };

    return { data: { success: true, data: mockData } };
  },
};

export const tenantLocationService = {
  // --- Branch Methods ---
  getAllBranches: async () => api.get('/tenant/locations/branches'),
  createBranch: async (data) => api.post('/tenant/locations/branches', data),
  updateBranch: async (id, data) => api.put(`/tenant/locations/branches/${id}`, data),
  deleteBranch: async (id) => api.delete(`/tenant/locations/branches/${id}`),

  // --- Warehouse Methods ---
  getAllWarehouses: async () => api.get('/tenant/locations/warehouses'),
  createWarehouse: async (data) => api.post('/tenant/locations/warehouses', data),
  updateWarehouse: async (id, data) => api.put(`/tenant/locations/warehouses/${id}`, data),
  deleteWarehouse: async (id) => api.delete(`/tenant/locations/warehouses/${id}`),
};

export const tenantUserService = {
  getAll: async () => api.get('/tenant/users'),
  create: async (userData) => api.post('/tenant/users', userData),
  update: async (id, userData) => api.put(`/tenant/users/${id}`, userData),
  delete: async (id) => api.delete(`/tenant/users/${id}`), // This is the deactivate route
  adminResetPassword: async (userId, newPassword) => {
    return api.patch(`/tenant/users/${userId}/reset-password`, newPassword);
  },
};

// --- NEW ACCOUNTING SERVICE ---
export const tenantAccountingService = {
  /**
   * Fetches all accounts in the tenant's Chart of Accounts.
   */
  getAllAccounts: async () => {
    return api.get('/tenant/accounting/accounts');
  },

  /**
   * Creates a new account in the Chart of Accounts.
   * @param {object} accountData - The data for the new account.
   */
  createAccount: async (accountData) => {
    return api.post('/tenant/accounting/accounts', accountData);
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
    return api.get('/tenant/accounting/ledger', { params });
  },

  getChart: () => api.get('/tenant/accounting/chart'),

  /**
   * Fetches the Chart of Accounts with support for pagination and filtering.
   * @param {string} queryParams - The URL query string (e.g., 'page=1&limit=25&search=cash').
   */
  getChartOfAccounts: (queryParams) => {
    return api.get(`/tenant/accounting/chart?${queryParams}`);
  },

  getAccountById: (accountId) => {
    return api.get(`/tenant/accounting/accounts/${accountId}`);
  },
  /**
   * Fetches all ledger entries for a specific account with pagination.
   * @param {string} accountId - The ID of the account.
   * @param {string} queryParams - The URL query string for pagination.
   */
  getLedgerForAccount: (accountId, queryParams) => {
    return api.get(`/tenant/accounting/accounts/${accountId}/ledger?${queryParams}`);
  },
};

// --- NEW CUSTOMER (CRM) SERVICE ---
export const tenantCustomerService = {
  getAll: async () => api.get('/tenant/crm/customers'),
  getById: async (id) => api.get(`/tenant/crm/customers/${id}`),
  getByName: async (name) => {
    return api.get('/tenant/crm/customers', { params: { name: name, limit: 1 } });
  },
  create: async (data) => api.post('/tenant/crm/customers', data),
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

export const tenantCustomerGroupService = {
  getAll: async () => api.get('/tenant/crm/groups'),
  create: async (data) => api.post('/tenant/crm/groups', data),
  update: async (id, data) => api.put(`/tenant/crm/groups/${id}`, data),
  delete: async (id) => api.delete(`/tenant/crm/groups/${id}`),
};

// --- NEW SUPPLIER (PROCUREMENT) SERVICE ---
export const tenantSupplierService = {
  getAll: async () => api.get('/tenant/procurement/suppliers'),
  getById: async (id) => api.get(`/tenant/procurement/suppliers/${id}`),
  create: async (data) => api.post('/tenant/procurement/suppliers', data),
  update: async (id, data) => api.put(`/tenant/procurement/suppliers/${id}`, data),
  delete: async (id) => api.delete(`/tenant/procurement/suppliers/${id}`),
  getSupplierLedger: async (id, params) => {
    return api.get(`/tenant/procurement/suppliers/${id}/ledger`, { params });
  },
};

export const tenantProfileService = {
  getMyProfile: async () => api.get('/tenant/profile'),
  updateLocalization: async (data) => api.put('/tenant/profile/localization', data),
  updateMyProfile: async (data) => api.put('/tenant/profile/me', data),
  updateCompanyProfile: async (profileData) => {
    return api.put('/tenant/profile/company', profileData);
  },
  adminResetPassword: async (userId, newPassword) => {
    return api.patch(`/tenant/users/${userId}/reset-password`, newPassword);
  },
};

// --- NEW METADATA SERVICES ---
export const tenantBrandService = {
  getAll: async () => api.get('/tenant/inventory/brands'),
  create: async (data) => api.post('/tenant/inventory/brands', data),
  update: async (id, data) => api.put(`/tenant/inventory/brands/${id}`, data),
  delete: async (id) => api.delete(`/tenant/inventory/brands/${id}`),
};

export const tenantCategoryService = {
  getAll: async () => api.get('/tenant/inventory/categories'),
  getHierarchy: async () => api.get('/tenant/inventory/categories'),
  create: async (data) => api.post('/tenant/inventory/categories', data),
  update: async (id, data) => api.put(`/tenant/inventory/categories/${id}`, data),
  delete: async (id) => api.delete(`/tenant/inventory/categories/${id}`),
};

export const tenantDeviceService = {
  getAll: async (params) => api.get('/tenant/inventory/devices', { params }),
  create: async (data) => api.post('/tenant/inventory/devices', data),
  update: async (id, data) => api.put(`/tenant/inventory/devices/${id}`, data),
  delete: async (id) => api.delete(`/tenant/inventory/devices/${id}`),
};

export const tenantRepairTypeService = {
  getAll: async (params) => api.get('/tenant/inventory/repairs', { params }),
  create: async (data) => api.post('/tenant/inventory/repairs', data),
  update: async (id, data) => api.put(`/tenant/inventory/repairs/${id}`, data),
  delete: async (id) => api.delete(`/tenant/inventory/repairs/${id}`),
};

export const tenantAttributeService = {
  // Methods for individual Attributes
  getAllAttributes: async () => api.get('/tenant/attributes'),
  createAttribute: async (data) => api.post('/tenant/attributes', data),
  updateAttribute: async (id, data) => api.put(`/tenant/attributes/${id}`, data),
  deleteAttribute: async (id) => api.delete(`/tenant/attributes/${id}`),
  // Methods for Attribute Sets
  getAllAttributeSets: async () => api.get('/tenant/attributes/sets'),
  createAttributeSet: async (data) => api.post('/tenant/attributes/sets', data),
  updateAttributeSet: async (id, data) => api.put(`/tenant/attributes/sets/${id}`, data),
  deleteAttributeSet: async (id) => api.delete(`/tenant/attributes/sets/${id}`),
};

export const tenantAttributeSetService = {
  getAll: () => api.get('/tenant/attributes/sets'),
  create: (data) => api.post('/tenant/attributes/sets', data),
  update: (id, data) => api.put(`/tenant/attributes/sets/${id}`, data),
  delete: (id) => api.delete(`/tenant/attributes/sets/${id}`),
};

export const tenantInventoryService = {
  /**
   * Fetches all product templates for the tenant.
   */
  getAllTemplates: (queryParams) => {
    const cleanParams = Object.fromEntries(Object.entries(queryParams).filter(([_, v]) => v != null && v !== ''));

    console.log('Fetching all product templates with params:', cleanParams);

    return api.get(`/tenant/inventory/templates`, { params: cleanParams });
  },

  /**
   * Fetches a single product template by its ID.
   * @param {string} templateId - The ID of the product template.
   */
  getTemplateById: (templateId) => {
    return api.get(`/tenant/inventory/templates/${templateId}`);
  },

  /**
   * Creates a new product template.
   * @param {object} data - The form data for the new template.
   */
  createTemplate: (data) => {
    return api.post('/tenant/inventory/templates', data);
  },

  /**
   * Updates an existing product template.
   * @param {string} templateId - The ID of the template to update.
   * @param {object} data - The updated data for the template.
   */
  updateTemplate: (templateId, data) => {
    return api.put(`/tenant/inventory/templates/${templateId}`, data);
  },

  /**
   * Deletes a product template.
   * @param {string} templateId - The ID of the template to delete.
   */
  deleteTemplate: (templateId) => {
    return api.delete(`/tenant/inventory/templates/${templateId}`);
  },

  /**
   * Fetches all product variants associated with a specific template.
   * @param {string} templateId - The ID of the product template.
   */
  getVariantsForTemplate: (templateId) => {
    return api.get(`/tenant/inventory/variants?templateId=${templateId}`);
  },

  /**
   * Triggers the variant generation process on the backend.
   * @param {string} templateId - The ID of the product template.
   * @param {object} options - The selected attribute options.
   */
  generateVariants: (templateId, options) => {
    return api.post(`/tenant/inventory/templates/${templateId}/generate-variants`, { options });
  },

  /**
   * Sends an array of variant data to be updated in a single batch operation.
   * @param {Array<object>} variants - The array of variant objects to update.
   */
  batchUpdateVariants: (variants) => {
    return api.patch('/tenant/inventory/variants/batch-update', { variants });
  },
};

// ---  PRODUCT SERVICE ---
// This service will house all product-related API calls.
export const tenantProductService = {
  // --- TEMPLATE METHODS ---
  getAllTemplates: async (params) => api.get('/tenant/inventory/templates', { params }),

  getTemplateById: async (id) => api.get(`/tenant/inventory/templates/${id}`),
  createTemplate: async (data) => api.post('/tenant/inventory/templates', data),
  updateTemplate: async (id, data) => api.put(`/tenant/inventory/templates/${id}`, data),
  deleteTemplate: async (id) => api.delete(`/tenant/inventory/templates/${id}`),

  getSummary: async () => api.get('/tenant/inventory/templates/summary'),

  /**
   * Fetches a single product variant by its ID.
   * @param {string} variantId - The ID of the product variant.
   */
  getVariantById: async (variantId) => api.get(`/tenant/inventory/products/variants/${variantId}`),

  // --- NEW VARIANT GENERATION METHOD ---
  /**
   * Calls the backend engine to generate all product variants for a template.
   * @param {string} templateId - The ID of the parent ProductTemplates.
   * @param {object} selections - The selected attribute options, e.g., { Color: ['Blue'], Storage: ['256GB'] }.
   */
  generateVariants: async (templateId, selections) => {
    return api.post(`/tenant/inventory/templates/${templateId}/generate-variants`, { selections });
  },

  /**
   * Triggers the variant synchronization process on the backend.
   * @param {string} templateId - The ID of the product template.
   * @param {object} options - The selected attribute options from the UI.
   */
  syncVariants: (templateId, options) => {
    return api.post(`/tenant/inventory/templates/${templateId}/sync-variants`, {
      options,
    });
  },

  // --- We will add variant-specific methods here later ---
  getAllVariantsForTemplate: async (templateId) =>
    api.get(`/tenant/inventory/products/variants?templateId=${templateId}`), // We need to build this backend route
  updateVariant: async (variantId, data) => api.put(`/tenant/inventory/products/variants/${variantId}`, data), // We need to build this backend route
  updateVariantImages: async (variantId, data) =>
    api.put(`/tenant/inventory/products/variants/${variantId}/image`, data), // We need to build this backend route
  // getAllVariants: async () => api.get(`/tenant/inventory/products/variants`), // We need to build this backend route
  getAllVariants: async (params) => api.get('/tenant/inventory/products/variants', { params }),

  /**
   * Performs a bulk update on multiple variants at once.
   * @param {Array<object>} variantsToUpdate - An array of objects with { _id, sku, sellingPrice, costPrice }.
   */
  bulkUpdateVariants: async (variantsToUpdate) => {
    // We will build this backend endpoint in a later chapter. For now, it's a placeholder.
    console.log('Calling bulk update with:', variantsToUpdate);
    //return Promise.resolve({ data: { success: true } });
    return api.patch('/tenant/inventory/products/variants/bulk-update', {
      variants: variantsToUpdate,
    });
  },

  searchVariants: async (searchTerm) => api.get(`/tenant/inventory/products/variants?search=${searchTerm}`), // We will build this backend route
};

// --- PURCHASE ORDER SERVICE ---
export const tenantPurchaseOrderService = {
  getAll: async (params) => api.get('/tenant/procurement/purchase-orders', { params }),
  getById: async (id) => api.get(`/tenant/procurement/purchase-orders/${id}`),
  create: async (data) => api.post('/tenant/procurement/purchase-orders', data),
  // update: async (id, data) => api.put(`/tenant/procurement/purchase-orders/${id}`, data),
  // delete: async (id) => api.delete(`/tenant/procurement/purchase-orders/${id}`),
  receiveGoods: async (poId, receivedData) => {
    return api.post(`/tenant/procurement/purchase-orders/${poId}/receive`, receivedData);
  },

  getPOsAwaitingInvoice: async () => {
    return api.get('/tenant/procurement/purchase-orders/awaiting-invoice');
  },
};

export const tenantCurrencyService = {
  // === Currency Methods ===

  /**
   * Fetches all supported currencies for the tenant.
   */
  getAllCurrencies: async () => api.get('/tenant/currencies'),

  /**
   * Creates a new supported currency.
   * @param {object} currencyData - e.g., { name, code, symbol }
   */
  createCurrency: async (currencyData) => api.post('/tenant/currencies', currencyData),

  /**
   * Updates a supported currency.
   * @param {string} id - The ID of the currency to update.
   * @param {object} currencyData - The updated data.
   */
  updateCurrency: async (id, currencyData) => api.put(`/tenant/currencies/${id}`, currencyData),

  /**
   * Deletes a supported currency.
   * @param {string} id - The ID of the currency to delete.
   */
  deleteCurrency: async (id) => api.delete(`/tenant/currencies/${id}`),

  // === Exchange Rate Methods ===

  /**
   * Fetches historical exchange rates with pagination and filtering.
   * @param {object} params - Query params like { page, limit, startDate, endDate }.
   */
  getExchangeRates: async (params) => api.get('/tenant/currencies/rates', { params }),

  /**
   * Creates or updates the exchange rate for a specific day.
   * @param {object} rateData - e.g., { fromCurrency, toCurrency, date, rate }
   */
  createOrUpdateExchangeRate: async (rateData) => api.post('/tenant/currencies/rates', rateData),

  /**
   * Deletes a specific exchange rate entry.
   * @param {string} id - The ID of the exchange rate entry to delete.
   */
  deleteExchangeRate: async (id) => api.delete(`/tenant/currencies/rates/${id}`),
};

// --- NEW UPLOAD SERVICE (Refactored for cleaner code) ---
export const tenantUploadService = {
  /**
   * Gets a secure, temporary signature from the backend for direct-to-cloud uploads.
   */
  getCloudinarySignature: async () => {
    return api.post('/tenant/uploads/signature', {
      timestamp: Math.round(new Date().getTime() / 1000),
    });
  },
};

// ---  GRN SERVICE ---
export const tenantGrnService = {
  /**
   * Fetches only GRNs that have a status of 'pending_invoice'.
   */
  getAwaitingInvoice: async () => {
    return api.get('/tenant/procurement/grns/awaiting-invoice');
  },
  /**
   * Fetches the full details for one or more GRNs to begin reconciliation.
   * @param {string[]} grnIds - An array of Goods Receipt Note IDs.
   */
  getDetailsForReconciliation: async (grnIds) => {
    return api.post('/tenant/procurement/grns/by-ids', { grnIds });
  },
  /**
   * Fetches the full details of a single Goods Receipt Note.
   * @param {string} grnId - The ID of the GRN.
   */
  getById: async (grnId) => {
    return api.get(`/tenant/procurement/grns/${grnId}`);
  },
  getGrnByPoId: async (grnId) => {
    return api.get(`/tenant/procurement/grns/${grnId}`);
  },
  getAll: async (params) => api.get('/tenant/procurement/grns', { params }),

  generatePrintJob: async (templateId, items) => {
    return api.post('/tenant/inventory/print/labels', { templateId, items });
  },
};

// --- PAYMENT METHOD SERVICE ---
export const tenantPaymentMethodService = {
  getAll: async () => api.get('/tenant/payments/methods'),
  create: async (data) => api.post('/tenant/payments/methods', data),
  update: async (id, data) => api.put(`/tenant/payments/methods/${id}`, data),
  delete: async (id) => api.delete(`/tenant/payments/methods/${id}`),
};

export const tenantChequeService = {
  /**
   * Fetches all cheques with a 'pending_clearance' status.
   */
  getPending: async () => {
    return api.get('/tenant/payments/cheques/pending');
  },

  /**
   * Updates the status of a specific cheque.
   * @param {string} chequeId - The ID of the cheque to update.
   * @param {object} statusData - The new status, e.g., { status: 'cleared' }
   */
  updateStatus: async (chequeId, statusData) => {
    return api.patch(`/tenant/payments/cheques/${chequeId}/status`, statusData);
  },
};

// --- INVOICE SERVICE ---
export const tenantInvoiceService = {
  getAll: async (params) => api.get('/tenant/procurement/invoices', { params }),
  /**
   * Fetches the full details of a single Supplier Invoice.
   * @param {string} invoiceId - The ID of the supplier invoice.
   */
  getById: async (invoiceId) => {
    return api.get(`/tenant/procurement/invoices/${invoiceId}`);
  },

  /**
   * Records a payment against a specific Supplier Invoice.
   * @param {string} invoiceId - The ID of the supplier invoice being paid.
   * @param {object} paymentData - The payment details from the form.
   */
  recordPayment: async (invoiceId, paymentData) => {
    return api.post(`/tenant/procurement/invoices/${invoiceId}/payments`, paymentData);
  },
};

// --- SERVICE for the universal payments list ---
export const tenantPaymentService = {
  /**
   * Fetches all payment transactions with filtering and pagination.
   * @param {object} params - { page, limit, direction, paymentMethodId, etc. }
   */
  getAll: async (params) => api.get('/tenant/payments/transactions', { params }),
  /**
   * Fetches a single payment by its ID with all details.
   */
  getById: async (id) => api.get(`/tenant/payments/transactions/${id}`),
};

// --- STOCK SERVICE ---
export const tenantStockService = {
  /**
   * Fetches an aggregated summary of stock levels with filtering and pagination.
   * @param {object} params - { page, limit, branchId, searchTerm }.
   */
  getStockLevels: async (params) => {
    return api.get('/tenant/inventory/stock/levels', { params });
  },
  /**
   * Fetches summary KPI metrics for a single product variant.
   * @param {string} variantId - The ID of the product variant.
   */
  getDetails: async (variantId) => {
    return api.get(`/tenant/inventory/stock/details/${variantId}`);
  },

  getSummary: async (params) => {
    return api.get('/tenant/inventory/stock/summary', { params });
  },

  /**
   * Fetches the paginated history of manual stock adjustments.
   * @param {object} params - { page, limit, branchId, userId, startDate, endDate }.
   */
  getAdjustmentHistory: async (params) => {
    return api.get('/tenant/inventory/adjustments/history', { params });
  },

  /**
   * Fetches the paginated movement history for a single product variant.
   * @param {string} variantId - The ID of the product variant.
   * @param {object} params - Query params like { page, limit, branchId }.
   */
  getMovements: async (variantId, params) => {
    return api.get(`/tenant/inventory/stock/movements/${variantId}`, {
      params,
    });
  },

  /**
   * Submits a manual stock adjustment.
   * @param {object} adjustmentData - { ProductVariantId, branchId, quantityChange, notes, reason }
   */
  createAdjustment: async (adjustmentData) => {
    return api.post('/tenant/inventory/stock/adjustments', adjustmentData);
  },

  getLotQuantity: async (ProductVariantId, branchId) => {
    return api.get('/tenant/inventory/stock/lot-quantity', {
      params: { ProductVariantId, branchId },
    });
  },
  getAvailableSerials: async (ProductVariantId, branchId, params) => {
    return api.get('/tenant/inventory/stock/available-serials', {
      params: { ProductVariantId, branchId, ...params },
    });
  },

  getLotsForVariant: async (ProductVariantId, branchId) => {
    return api.get('/tenant/inventory/stock/lots-for-variant', {
      params: { ProductVariantId, branchId },
    });
  },

  // getStockDetails and getStockMovements will be added later
};

// --- Transfer Service ---
export const tenantTransferService = {
  /**
   * Creates a new stock transfer order.
   * @param {object} transferData - The data for the new transfer order.
   */
  create: async (transferData) => {
    return api.post('/tenant/inventory/stock/transfers', transferData);
  },

  /**
   * Fetches all stock transfers with optional filtering and pagination.
   * @param {object} params - Query params like { page, limit, status }.
   */
  getAll: async (params) => {
    return api.get('/tenant/inventory/stock/transfers', { params });
  },

  /**
   * Fetches the details of a single stock transfer.
   * @param {string} transferId - The ID of the transfer.
   */
  getById: async (transferId) => {
    return api.get(`/tenant/inventory/stock/transfers/${transferId}`);
  },

  /**
   * Dispatches the items for a transfer order.
   * @param {string} transferId - The ID of the transfer to dispatch.
   */
  dispatch: async (transferId) => {
    return api.post(`/tenant/inventory/stock/transfers/${transferId}/dispatch`);
  },

  /**
   * Confirms receipt of items for a transfer order.
   * @param {string} transferId - The ID of the transfer to receive.
   */
  receive: async (transferId) => {
    return api.post(`/tenant/inventory/stock/transfers/${transferId}/receive`);
  },
};

// --- Installment Service ---
export const tenantInstallmentService = {
  /**
   * Creates a new installment plan.
   * @param {object} planData - Data to create the plan (totalAmount, installments, etc.).
   */
  create: async (planData) => {
    return api.post('/tenant/payments/installments', planData);
  },

  getAllForCustomer: async (customerId) => {
    return api.get('/tenant/payments/installments', { params: { customerId } });
  },

  /**
   * Fetches the full details of a single installment plan.
   * @param {string} planId - The ID of the installment plan.
   */
  getById: async (planId) => {
    return api.get(`/tenant/payments/installments/${planId}`);
  },

  /**
   * Applies a payment to a specific line item within an installment plan.
   * @param {string} planId - The ID of the installment plan.
   * @param {string} lineId - The ID of the specific installment line being paid.
   * @param {object} paymentData - The universal payment data from the PaymentForm.
   */
  applyPayment: async (planId, lineId, paymentData) => {
    return api.post(`/tenant/payments/installments/${planId}/lines/${lineId}/pay`, paymentData);
  },
};

// --- Label SERVICE ---

export const tenantLabelTemplateService = {
  /**
   * Fetches all saved label templates for the tenant.
   */
  getAll: async () => api.get('/tenant/printing/label-templates'),

  /**
   * Fetches a single label template by its ID.
   * @param {string} id - The ID of the template.
   */
  getById: async (id) => api.get(`/tenant/printing/label-templates/${id}`),

  /**
   * Creates a new label template.
   * @param {object} templateData - The data for the new template design.
   */
  create: async (templateData) => api.post('/tenant/printing/label-templates', templateData),

  /**
   * Updates an existing label template.
   * @param {string} id - The ID of the template to update.
   * @param {object} templateData - The updated template design.
   */
  update: async (id, templateData) => api.put(`/tenant/printing/label-templates/${id}`, templateData),

  /**
   * Deletes a label template.
   * @param {string} id - The ID of the template to delete.
   */
  delete: async (id) => api.delete(`/tenant/printing/label-templates/${id}`),
};

export const tenantPrintService = {
  /**
   * Calls the backend to generate print-ready HTML for labels.
   * @param {string} templateId - The ID of the label template to use.
   * @param {Array<object>} items - The list of items to print labels for.
   */
  generateLabels: async (templateId, items, isPreview) => {
    return api.post('/tenant/inventory/print/labels', {
      templateId,
      items,
      isPreview,
    });
  },
  generatePrintJob: async (templateId, items, isPreview) => {
    return api.post('/tenant/inventory/print/labels', {
      templateId,
      items,
      isPreview,
    });
  },
  generateLabelPreview: async (templateData, itemData) => {
    return api.post('/tenant/inventory/print/label-preview', {
      template: templateData,
      itemData: itemData,
    });
  },
};

export const tenantShiftService = {
  /**
   * Gets the current user's currently open shift, if any.
   */
  getActive: async () => api.get('/tenant/sales/shifts/active'),

  /**
   * Opens a new shift for the current user.
   * @param {object} data - { openingFloat }
   */
  openShift: async (data) => api.post('/tenant/sales/shifts/open', data),

  /**
   * Closes a specific shift and performs reconciliation.
   * @param {string} shiftId - The ID of the shift to close.
   * @param {object} data - { closingFloat }
   */
  closeShift: async (shiftId, data) =>
    api.patch(`/tenant/sales/shifts/${shiftId}/close`, {
      shiftId,
      ...data,
    }),

  /**
   * Gets a paginated history of closed shifts.
   * @param {object} params - { page, limit }
   */
  getHistory: async (params) => api.get('/tenant/sales/shifts/history', { params }),
};

export const tenantAssemblyService = {
  /**
   * Creates a new assembly job.
   * @param {object} assemblyData - The data for the assembly job.
   */
  create: async (assemblyData) => {
    return api.post('/tenant/inventory/assemblies', assemblyData);
  },
};

export const tenantRepairService = {
  getAll: async (params) => api.get('/tenant/service/tickets', { params }),
  getById: async (ticketId) => api.get(`/tenant/service/tickets/${ticketId}`),
  createTicket: async (ticketData) => api.post('/tenant/service/tickets', ticketData),
  updateTicketStatus: async (ticketId, statusData) =>
    api.patch(`/tenant/service/tickets/${ticketId}/status`, statusData),
  addItemToJobSheet: async (ticketId, itemData) => api.post(`/tenant/service/tickets/${ticketId}/jobsheet`, itemData),
  removeJobSheetItem: async (ticketId, itemId) => api.delete(`/tenant/service/tickets/${ticketId}/jobsheet/${itemId}`),
};

export const tenantHrService = {
  /**
   * Fetches all employees with pagination, and a list of unassigned users.
   * @param {object} params - e.g., { page, limit }
   */
  getAllEmployees: async (params) => {
    return api.get('/tenant/hr/employees', { params });
  },
  getEmployeeById: async (id) => {
    return api.get(`/tenant/hr/employees/${id}`);
  },

  /**
   * Creates a new employee record.
   * @param {object} employeeData - The data for the new employee.
   */
  createEmployee: async (employeeData) => {
    return api.post('/tenant/hr/employees', employeeData);
  },

  /**
   * Updates an existing employee's details.
   * @param {string} id - The ID of the employee to update.
   * @param {object} employeeData - The updated data.
   */
  updateEmployee: async (id, employeeData) => {
    return api.put(`/tenant/hr/employees/${id}`, employeeData);
  },

  /**
   * Deletes an employee record.
   * @param {string} id - The ID of the employee to delete.
   */
  deleteEmployee: async (id) => {
    return api.delete(`/tenant/hr/employees/${id}`);
  },
  getLeaveHistory: async (params) => {
    return api.get('/tenant/hr/leave', { params });
  },
  requestLeave: async (leaveData) => {
    return api.post('/tenant/hr/leave/request', leaveData);
  },
  updateLeaveStatus: async (id, leaveData) => {
    return api.patch('/tenant/hr/leave/' + id + '/status', leaveData);
  },
};

export const tenantPayrollService = {
  /**
   * Triggers a payroll run for a specific date range.
   * @param {object} dateRange - { startDate, endDate }
   */
  runPayroll: async (dateRange) => {
    return api.post('/tenant/hr/payroll/run', dateRange);
  },
  getHistory: async (params) => {
    return api.get('/tenant/hr/payroll/history', { params });
  },
  getRunById: async (runId) => {
    return api.get(`/tenant/hr/payroll/history/${runId}`);
  },
  getPayslipById: async (payslipId) => {
    return api.get(`/tenant/hr/payroll/payslips/${payslipId}`);
  },
  printRunById: async (runId) => {
    // In a real implementation, this would expect a PDF blob.
    // For now, it will get a JSON response.
    return api.get(`/tenant/hr/payroll/history/${runId}/print`);
    /*
    // The definitive implementation will look like this:
    return api.get(`/tenant/hr/payroll/history/${runId}/print`, {
        responseType: 'blob', // Tell axios to expect a file
    });
    */
  },
};

export const tenantAttendanceService = {
  /**
   * Gets the current user's active (not clocked out) session.
   */
  getActiveSession: async () => {
    return api.get('/tenant/hr/attendance/active');
  },

  /**
   * Creates a new attendance record for the current user (clocks them in).
   */
  clockIn: async () => {
    return api.post('/tenant/hr/attendance/clock-in');
  },

  /**
   * Clocks out the current user's active session.
   */
  clockOut: async () => {
    return api.patch('/tenant/hr/attendance/clock-out');
  },
  getTimesheet: async (params) => {
    return api.get('/tenant/hr/attendance/timesheet', { params });
  },

  /**
   * Updates an existing attendance record (Admin action).
   * @param {string} entryId - The ID of the attendance record.
   * @param {object} data - The updated data { checkInTime, checkOutTime, notes }.
   */
  updateEntry: async (entryId, data) => {
    return api.put(`/tenant/hr/attendance/${entryId}`, data);
  },

  /**
   * Creates a new, complete attendance record manually (Admin action).
   * @param {object} data - { employeeId, branchId, checkInTime, checkOutTime, notes }.
   */
  createManualEntry: async (data) => {
    // This would point to a new route, let's assume POST /hr/attendance/manual
    // For now, we will re-use the update controller logic on a non-existent entry
    // A dedicated endpoint is the better long-term solution.
    // Let's assume a dedicated endpoint for this.
    return api.post('/tenant/hr/attendance/manual', data);
  },
};

export const tenantDepartmentService = {
  getAll: async () => api.get('/tenant/hr/departments'),
  create: async (data) => api.post('/tenant/hr/departments', data),
  update: async (id, data) => api.put(`/tenant/hr/departments/${id}`, data),
  delete: async (id) => api.delete(`/tenant/hr/departments/${id}`),
};

export const tenantJobPositionService = {
  getAll: async () => api.get('/tenant/hr/job-positions'),
  create: async (data) => api.post('/tenant/hr/job-positions', data),
  update: async (id, data) => api.put(`/tenant/hr/job-positions/${id}`, data),
  delete: async (id) => api.delete(`/tenant/hr/job-positions/${id}`),
};

export const tenantDeductionRuleService = {
  /**
   * Fetches all deduction rules for the tenant.
   */
  getAll: async () => api.get('/tenant/hr/deduction-rules'),

  /**
   * Creates a new deduction rule.
   * @param {object} ruleData - The data for the new rule.
   */
  create: async (ruleData) => api.post('/tenant/hr/deduction-rules', ruleData),

  /**
   * Updates an existing deduction rule.
   * @param {string} id - The ID of the rule to update.
   * @param {object} ruleData - The updated rule data.
   */
  update: async (id, ruleData) => api.put(`/tenant/hr/deduction-rules/${id}`, ruleData),

  /**
   * Deletes a deduction rule.
   * @param {string} id - The ID of the rule to delete.
   */
  delete: async (id) => api.delete(`/tenant/hr/deduction-rules/${id}`),
};

export const tenantPricingService = {
  // Pricing Rules
  getAllRules: async () => api.get('/tenant/sales/pricing/rules'),
  createRule: async (data) => api.post('/tenant/sales/pricing/rules', data),
  updateRule: async (id, data) => api.put(`/tenant/sales/pricing/rules/${id}`, data),
  deleteRule: async (id) => api.delete(`/tenant/sales/pricing/rules/${id}`),

  // Promotions
  getAllPromotions: async () => api.get('/tenant/sales/pricing/promotions'),
  createPromotion: async (data) => api.post('/tenant/sales/pricing/promotions', data),
  updatePromotion: async (id, data) => api.put(`/tenant/sales/pricing/promotions/${id}`, data),
  deletePromotion: async (id) => api.delete(`/tenant/sales/pricing/promotions/${id}`),
};

export const tenantLeadService = {
  getAll: async (params) => api.get('/tenant/crm/leads', { params }),
  create: async (data) => api.post('/tenant/crm/leads', data),
  update: async (id, data) => api.put(`/tenant/crm/leads/${id}`, data),
  delete: async (id) => api.delete(`/tenant/crm/leads/${id}`),
  convert: async (id) => api.post(`/tenant/crm/leads/${id}/convert`),
};

export const tenantOpportunityService = {
  getAll: async (params) => api.get('/tenant/crm/opportunities', { params }),
  getById: async (id) => api.get(`/tenant/crm/opportunities/${id}`),
  create: async (data) => api.post('/tenant/crm/opportunities', data),
  update: async (id, data) => api.put(`/tenant/crm/opportunities/${id}`, data),
  delete: async (id) => api.delete(`/tenant/crm/opportunities/${id}`),
  updateStage: async (id, newStage, lossReason) => {
    return api.patch(`/tenant/crm/opportunities/${id}/stage`, { newStage, lossReason });
  },
  // --- ADD NEW FUNCTIONS ---
  addItem: async (id, itemData) => api.post(`/tenant/crm/opportunities/${id}/items`, itemData),
  removeItem: async (id, itemId) => api.delete(`/tenant/crm/opportunities/${id}/items/${itemId}`),
  // --- END OF NEW FUNCTIONS ---
};

export const tenantSalesOrderService = {
  // This new service will handle the "Closed-Won" action
  createFromOpportunity: async (opportunityId) => {
    return api.post(`/tenant/sales/orders/from-opportunity/${opportunityId}`);
  },
};

export const tenantActivityService = {
  getAllFor: async (relatedToType, relatedToId) =>
    api.get('/tenant/crm/activities', { params: { relatedToType, relatedToId } }),
  create: async (data) => api.post('/tenant/crm/activities', data),
};

export const tenantBenefitTypeService = {
  getAll: async () => api.get('/tenant/hr/benefits/types'),
  create: async (data) => api.post('/tenant/hr/benefits/types', data),
  update: async (id, data) => api.put(`/tenant/hr/benefits/types/${id}`, data),
  delete: async (id) => api.delete(`/tenant/hr/benefits/types/${id}`),
};

export const tenantEmployeeBenefitService = {
  getForEmployee: async (employeeId) => api.get(`/tenant/hr/benefits/assignments/employee/${employeeId}`),
  assignToEmployee: async (employeeId, data) =>
    api.post(`/tenant/hr/benefits/assignments/employee/${employeeId}`, data),
  delete: async (id) => api.delete(`/tenant/hr/benefits/assignments/${id}`),
};

export const tenantSearchService = {
  findDocument: async (query) => api.get(`/tenant/search/documents`, { params: { query } }),
};

export const tenantWarrantyPolicyService = {
  getAll: async () => api.get('/tenant/inventory/warranties'),
  create: async (data) => api.post('/tenant/inventory/warranties', data),
  update: async (id, data) => api.put(`/tenant/inventory/warranties/${id}`, data),
  delete: async (id) => api.delete(`/tenant/inventory/warranties/${id}`),
};

export const tenantCouponService = {
  // Coupon Batch (Campaign) Management
  getAllBatches: async () => api.get('/tenant/sales/pricing/coupons/batches'),
  createBatch: async (data) => api.post('/tenant/sales/pricing/coupons/batches', data),
  updateBatch: async (id, data) => api.put(`/tenant/sales/pricing/coupons/batches/${id}`, data),
  generateFromBatch: async (id, data) => api.post(`/tenant/sales/pricing/coupons/batches/${id}/generate`, data),

  /**
   * Gets all unique coupon codes for a given batch, with filters.
   * @param {string} batchId - The ID of the coupon campaign.
   * @param {object} params - { page, limit, status }
   */
  getCouponsForBatch: async (batchId, params) => {
    return api.get(`/tenant/sales/pricing/coupons/by-batch/${batchId}`, { params });
  },

  // Coupon Redemption
  validate: async (code, cartTotal) => api.post('/tenant/sales/pricing/coupons/validate', { code, cartTotal }),
};

export const tenantReconciliationService = {
  postInvoice: async (invoiceData) => {
    // We will build this backend API in the next step.
    // For now, we define the service that will call it.
    // The endpoint will likely be /tenant/procurement/invoices
    return api.post('/tenant/procurement/invoices', invoiceData);
  },

  /**
   * Uploads a statement by sending the file URL and metadata to the backend.
   * @param {object} data - { fileUrl, accountId, statementDate }
   */
  uploadStatement: async (data) => {
    return api.post('/tenant/accounting/reconciliation/upload', data);
  },

  /**
   * Fetches suggested matches for a given statement.
   * @param {string} statementId - The ID of the bank statement.
   */
  getSuggestions: async (statementId) => {
    return api.get(`/tenant/accounting/reconciliation/suggest/${statementId}`);
  },

  /**
   * Confirms a match between a statement line and ledger entries.
   * @param {object} data - { statementId, statementLineId, ledgerEntryIds }
   */
  confirmMatch: async (data) => {
    return api.post('/tenant/accounting/reconciliation/confirm-match', data);
  },
};

export const tenantClosingService = {
  /**
   * Gets the status of all pre-closing validation tasks for a given period.
   * @param {string} periodId - The ID of the financial period.
   */
  getClosingStatus: async (periodId) => {
    return api.get(`/tenant/accounting/closing/status/${periodId}`);
  },

  /**
   * Triggers the action to close a financial period.
   * @param {string} periodId - The ID of the financial period to close.
   */
  closePeriod: async (periodId) => {
    return api.post(`/tenant/accounting/closing/close/${periodId}`);
  },

  // We will need these later for the period selector
  getAllPeriods: async () => api.get('/tenant/accounting/periods'),
  createPeriod: async (data) => api.post('/tenant/accounting/periods', data),
};

export default api;
