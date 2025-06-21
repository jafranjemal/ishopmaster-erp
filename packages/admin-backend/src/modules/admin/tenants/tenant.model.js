const mongoose = require("mongoose");

// A constant defining all possible modules in the system.
// This acts as a single source of truth for validation.
const AVAILABLE_MODULES = [
  "pos",
  "inventory",
  "repairs",
  "accounting",
  "crm",
  "hr",
  "reports",
  "settings",
];

const tenantSchema = new mongoose.Schema(
  {
    companyProfile: {
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
      },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      registrationNumber: { type: String, trim: true },
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    subdomain: {
      type: String,
      required: [true, "Subdomain is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "Subdomain can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    dbName: {
      type: String,
      required: [true, "Database name is required"],
      unique: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // --- NEW MODULARITY FIELDS START HERE ---

    /**
     * An array of strings representing the modules that are active for this tenant.
     * This acts as the primary feature flag system for the entire ERP.
     */

    enabledModules: {
      type: [String], // The 'enum' validation is removed.
      default: ["pos", "inventory", "crm", "reports", "settings"],
    },
    /**
     * A flexible, nested object to store tenant-specific settings for each module.
     * This allows for deep customization without cluttering the main schema.
     */
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        // --- NEW LOCALIZATION SETTINGS ---
        localization: {
          /**
           * The primary currency for all financial reporting (e.g., 'USD', 'LKR', 'INR').
           * All ledger entries will be stored in this currency.
           */
          baseCurrency: "USD",
          /**
           * An array of currency codes the tenant operates in.
           * This will populate currency options in the POS.
           */
          supportedCurrencies: ["USD"],
          /**
           * The default language for the tenant's UI. (e.g., 'en', 'es', 'si')
           */
          defaultLanguage: "en",
          /**
           * The IANA timezone identifier for the tenant (e.g., 'Asia/Colombo').
           * Used to ensure all dates and times are displayed correctly.
           */
          timezone: "UTC",
        },
        // --- END OF NEW LOCALIZATION SETTINGS ---

        // Example structure for POS settings
        pos: {
          enableCreditSales: true,
          defaultPaymentMethod: "cash",
          invoicePrefix: "INV-",
        },
        // Example structure for Inventory settings
        inventory: {
          lowStockThreshold: 10,
          defaultWarehouseId: null,
        },
        // Other module settings would be added here by their respective modules.
        repairs: {
          defaultWarrantyDays: 30,
        },
      },
    },

    // --- NEW MODULARITY FIELDS END HERE ---
  },
  { timestamps: true }
);

// Mongoose automatically handles creating the `settings` object with its defaults.
// No additional pre-save hooks are needed for this logic.

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;
