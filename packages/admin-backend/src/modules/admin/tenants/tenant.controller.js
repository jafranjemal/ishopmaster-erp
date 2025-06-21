const asyncHandler = require("../../../middleware/asyncHandler"); // Import our new service
const {
  getTenantConnection,
  getTenantModels,
} = require("../../../services/database.service");
const Module = require("../modules/Module");
const Tenant = require("./tenant.model");
const Permission = require("../permissions/permission.model");
const accountingService = require("../../../services/accounting.service");
const customerService = require("../../../services/customer.service");

const BRAND_MASTER_LIST = require("../constants/brand.masterlist"); // <-- 1. Import Brands
const CATEGORY_MASTER_LIST = require("../constants/category.masterlist"); // <-- 2. Import Categories
const ATTRIBUTE_SET_MASTER_LIST = require("../constants/attributeSet.masterlist"); // <-- 2. Import Categories
const ATTRIBUTE_MASTER_LIST = require("../constants/attribute.masterlist"); // <-- 2. Import Categories

// @desc    Create a new tenant
// @route   POST /api/v1/tenants
// @access  Private (to be implemented)
exports.createTenantOld = asyncHandler(async (req, res, next) => {
  // In a real app, you might get the user from req.user to log who created it

  // Step 1: Create the tenant record in the admin database.
  const tenant = await Tenant.create(req.body);

  // Step 2: Provision the new database for this tenant.
  try {
    console.log(
      `Attempting to provision database for tenant: ${tenant.companyName}`
    );

    // The act of creating a connection will implicitly create the DB in MongoDB.
    const tenantDbConnection = await getTenantConnection(tenant.dbName);

    // Test the connection by pinging the admin database.
    // This confirms the connection is live before we proceed.
    const ping = await tenantDbConnection.db.admin().ping();
    if (!ping.ok) {
      throw new Error("Could not ping the newly created tenant database.");
    }

    console.log(
      `Database ${tenant.dbName} provisioned and connected successfully.`
    );

    // Once the connection is established, you could proceed to seed the database
    // with initial collections and data, like a 'users' collection with a default admin.
    // We will do this in the next chapter.

    // Close the connection as it's only needed for provisioning at this stage.
    // In later chapters, other services will manage connections for API requests.
    await tenantDbConnection.close();
  } catch (err) {
    console.error(
      `Failed to provision database for tenant ${tenant._id}. Rolling back.`,
      err
    );
    // This is a critical failure. Roll back the tenant creation to avoid an inconsistent state.
    await Tenant.findByIdAndDelete(tenant._id);
    // Pass a specific error to the error handler.
    return res.status(500).json({
      success: false,
      error: `Failed to provision tenant database: ${err.message}`,
    });
  }

  // Step 3: Respond to the client.
  res.status(201).json({
    success: true,
    data: tenant,
    message: "Tenant created and database provisioned successfully.",
  });
});

exports.createTenant = asyncHandler(async (req, res, next) => {
  const { tenantInfo, primaryBranch, owner } = req.body;

  if (!tenantInfo || !primaryBranch || !owner) {
    return res.status(400).json({
      success: false,
      error:
        "Request body must include tenantInfo, primaryBranch, and owner objects.",
    });
  }
  if (!tenantInfo.enabledModules || !Array.isArray(tenantInfo.enabledModules)) {
    return res
      .status(400)
      .json({ success: false, error: "enabledModules array is required." });
  }

  const existingTenant = await Tenant.findOne({
    $or: [
      { subdomain: tenantInfo.subdomain },
      { companyName: tenantInfo.companyName },
    ],
  });
  if (existingTenant) {
    return res.status(400).json({
      success: false,
      error: "A tenant with that subdomain or company name already exists.",
    });
  }

  const dbName = `tenant_${tenantInfo.subdomain.replace(/-/g, "_")}`;
  let tenantDbConnection;
  let newTenant;

  try {
    tenantDbConnection = await getTenantConnection(dbName);
    const models = getTenantModels(tenantDbConnection);
    const session = await tenantDbConnection.startSession();

    await session.withTransaction(async () => {
      // 1. Seed default accounts
      await accountingService.seedDefaultAccounts(models, session);

      // 2. Create the Primary Branch
      const branches = await models.Branch.create(
        [{ ...primaryBranch, isPrimary: true }],
        { session }
      );
      const createdBranch = branches[0];

      // 3. Fetch master permissions list
      const allPermissions = await Permission.find({}).select("key").lean();
      const allPermissionKeys = allPermissions.map((p) => p.key);

      // 4. Create ALL default roles in a single, efficient database call.
      const rolesToCreate = [
        {
          name: "Super Admin",
          description: "Has all permissions.",
          permissions: allPermissionKeys,
          isDeletable: false,
          isSystemRole: true,
        },
        {
          name: "Manager",
          description: "Manages most aspects of the shop.",
          permissions: [
            "inventory:product:view",
            "sales:invoice:view_all",
            "settings:user:manage",
          ],
          isDeletable: false,
          isSystemRole: true,
        },
        {
          name: "Cashier",
          description: "Performs sales and manages their shift.",
          permissions: [
            "sales:pos:access",
            "sales:invoice:view_own",
            "crm:customer:manage",
          ],
          isDeletable: false,
          isSystemRole: true,
        },
      ];

      // --- THE FIX IS HERE ---
      // We now use insertMany and provide the required `ordered: true` option within the session options.
      const createdRoles = await models.Role.insertMany(rolesToCreate, {
        session,
        ordered: true,
      });
      const adminRole = createdRoles.find((r) => r.name === "Super Admin");

      if (!adminRole)
        throw new Error("Could not find Super Admin role after seeding.");

      // 5. Seed the Owner's user account
      // Using create with a single-item array is the correct syntax for transactions.
      await models.User.create(
        [
          {
            name: owner.name,
            email: owner.email,
            password: owner.password,
            role: adminRole._id,
            assignedBranchId: createdBranch._id,
          },
        ],
        { session }
      );

      // Seed the Default Walking Customer for POS sales
      await customerService.createCustomerWithLedger(
        models,
        {
          isSystemCreated: true,
          name: "Walking Customer",
          phone: "000-000-0000", // A unique placeholder phone number
          // All other fields will use schema defaults
        },
        session
      );

      // --- 4. ADD THIS NEW BLOCK ---
      // Seed default Brands and Categories
      console.log("Seeding master data: Brands and Categories...");

      await models.Brand.insertMany(
        BRAND_MASTER_LIST.map((b) => ({ name: b.name })),
        { session, ordered: true }
      );
      const createdCategories = await models.Category.insertMany(
        CATEGORY_MASTER_LIST.map((c) => ({ name: c.name })),
        { session, ordered: true }
      );
      const createdAttributes = await models.Attribute.insertMany(
        ATTRIBUTE_MASTER_LIST,
        { session, ordered: true }
      );
      const attributeIdMap = new Map();
      createdAttributes.forEach((attr) => {
        attributeIdMap.set(attr.key, attr._id);
      });

      const attributeSetsToCreate = ATTRIBUTE_SET_MASTER_LIST.map((set) => ({
        name: set.name,
        attributes: set.attributeKeys
          .map((key) => attributeIdMap.get(key))
          .filter(Boolean), // Look up IDs from the map
      }));
      const createdAttributeSets = await models.AttributeSet.insertMany(
        attributeSetsToCreate,
        { session, ordered: true }
      );

      const categoryUpdatePromises = [];
      const categoryMap = new Map(
        createdCategories.map((c) => [
          CATEGORY_MASTER_LIST.find((cm) => cm.name === c.name).key,
          c._id,
        ])
      );
      const attributeSetMap = new Map(
        createdAttributeSets.map((as) => [
          ATTRIBUTE_SET_MASTER_LIST.find((asm) => asm.name === as.name)
            .categoryKey,
          as._id,
        ])
      );

      for (const [categoryKey, attributeSetId] of attributeSetMap.entries()) {
        const categoryId = categoryMap.get(categoryKey);
        if (categoryId) {
          categoryUpdatePromises.push(
            models.Category.updateOne(
              { _id: categoryId },
              { $set: { attributeSetId: attributeSetId } },
              { session }
            )
          );
        }
      }
      await Promise.all(categoryUpdatePromises);

      console.log("✅ Master data seeded successfully.");
      // --- END OF NEW BLOCK ---
    });

    session.endSession();
    console.log(
      `Tenant DB ${dbName} provisioned successfully within a transaction.`
    );

    // 6. ONLY after the tenant DB is successfully provisioned, create the tenant record in the Admin DB.
    newTenant = await Tenant.create({ ...tenantInfo, dbName });

    res.status(201).json({
      success: true,
      data: newTenant,
      message: "Tenant created and provisioned successfully.",
    });
  } catch (err) {
    console.error(
      `CRITICAL: Failed during provisioning. Full cleanup required.`,
      err
    );

    if (tenantDbConnection) {
      await tenantDbConnection.db.dropDatabase();
    }
    if (newTenant) {
      // Should not happen with this logic, but a good safeguard
      await Tenant.findByIdAndDelete(newTenant._id);
    }

    return res.status(500).json({
      success: false,
      error: `Failed to provision tenant: ${err.message}`,
    });
  }
});

// @desc    Get all tenants
// @route   GET /api/v1/tenants
// @access  Private
exports.getAllTenants = asyncHandler(async (req, res, next) => {
  const tenants = await Tenant.find({});

  res.status(200).json({
    success: true,
    count: tenants.length,
    data: tenants,
  });
});

// @desc    Get a single tenant by ID
// @route   GET /api/v1/tenants/:id
// @access  Private
exports.getTenantById = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    // This check is important for a user-friendly error message.
    return res.status(404).json({
      success: false,
      error: `Tenant not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: tenant,
  });
});

// @desc    Delete a tenant
// @route   DELETE /api/v1/tenants/:id
// @access  Private

// @desc    Delete a tenant
// @route   DELETE /api/v1/tenants/:id
// @access  Private
exports.deleteTenant = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      error: `Tenant not found with id of ${req.params.id}`,
    });
  }

  // This is a destructive operation. We wrap it in a try/catch block.
  try {
    // 1. Get a temporary connection to the tenant's database.
    const tenantDbConnection = await getTenantConnection(tenant.dbName);

    // 2. Issue the command to drop the entire database.
    await tenantDbConnection.db.dropDatabase();
    console.log(`Successfully dropped database: ${tenant.dbName}`);

    // 3. Close the temporary connection.
    await tenantDbConnection.close();

    // 4. ONLY after the database is successfully dropped, delete the tenant's
    //    record from the central admin database.
    await tenant.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: `Tenant "${tenant.companyName}" and all associated data have been permanently deleted.`,
    });
  } catch (error) {
    console.error(
      `Failed to delete tenant database for ${tenant.companyName}:`,
      error
    );
    return res.status(500).json({
      success: false,
      error:
        "Failed to delete tenant database. The tenant record was not removed. Please check server logs.",
    });
  }
});

// @desc    Update a tenant's general details
// @route   PUT /api/v1/tenants/:id
// @access  Private
exports.updateTenant = asyncHandler(async (req, res, next) => {
  // 1. Create a "whitelist" of fields that are allowed to be updated via this endpoint.
  // This is the most secure pattern.
  const fieldsToUpdate = {
    companyName: req.body.companyName,
    subdomain: req.body.subdomain, // Assuming you want this to be updatable
    licenseExpiry: req.body.licenseExpiry,
    isActive: req.body.isActive,
    // Add any other general fields here, e.g., 'address', 'phone'
  };

  // 2. Remove any keys that were not provided in the request body.
  // This prevents accidentally overwriting existing fields with `undefined`.
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // 3. Perform a single, efficient, and secure update call.
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  // 4. Handle the "not found" case.
  if (!tenant) {
    return res.status(404).json({ success: false, error: `Tenant not found` });
  }

  res.status(200).json({ success: true, data: tenant });
});

// @desc    Update a tenant's enabled modules
// @route   PUT /api/v1/tenants/:id/modules
// @access  Private (Super Admin)
exports.updateTenantModules = asyncHandler(async (req, res, next) => {
  const { modules } = req.body;

  // Basic validation
  if (!Array.isArray(modules)) {
    return res
      .status(400)
      .json({ success: false, error: "Modules must be provided as an array." });
  }

  // --- NEW VALIDATION STEP ---
  const availableModules = await Module.find({
    key: { $in: modules },
    isGloballyActive: true,
  });
  if (availableModules.length !== modules.length) {
    return res.status(400).json({
      success: false,
      error: "Request contains invalid or inactive modules.",
    });
  }
  // --- END VALIDATION ---

  const tenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { $set: { enabledModules: modules } }, // Use $set for a targeted update
    { new: true, runValidators: true }
  );

  if (!tenant) {
    return res.status(404).json({ success: false, error: "Tenant not found." });
  }

  res.status(200).json({ success: true, data: tenant });
});
