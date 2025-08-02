const asyncHandler = require("../../../middleware/asyncHandler") // Import our new service
const { getTenantConnection, getTenantModels } = require("../../../services/database.service")
const Module = require("../modules/Module")
const Tenant = require("./tenant.model")
const Permission = require("../permissions/permission.model")
const accountingService = require("../../../services/accounting.service")
const customerService = require("../../../services/customer.service")

const BRAND_MASTER_LIST = require("../constants/brand.masterlist") // <-- 1. Import Brands
const CATEGORY_MASTER_LIST = require("../constants/category.masterlist") // <-- 2. Import Categories
const ATTRIBUTE_SET_MASTER_LIST = require("../constants/attributeSet.masterlist") // <-- 2. Import Categories
const ATTRIBUTE_MASTER_LIST = require("../constants/attribute.masterlist") // <-- 2. Import Categories
const tenantProvisioningService = require("../../../services/tenantProvisioning.service")

const PRODUCT_TEMPLATE_MASTER_LIST = require("../constants/productTemplate.masterlist")
const DEVICE_MASTER_LIST = require("../constants/device.masterlist")
const warrantyPolicyList = require("../constants/warrantyPolicy.masterlist")
const defaultQc = require("../constants/qc.masterlist")

function _chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

const createVariantsFromAttributes = async function (models, template, attributeSet, barcode, session = null) {
  if (!attributeSet || !attributeSet.attributes || attributeSet.attributes.length === 0) {
    throw new Error("No attributes available to generate variants")
  }
  console.log(`Creating variant for ${template.type}: ${template.baseName}`)

  // Prepare attribute options (array of arrays)
  const attributeValueOptions = attributeSet.attributes.map((attr) => attr.values.map((value) => ({ key: attr.key, value })))

  // Cartesian product helper
  const cartesian = (arrays) => arrays.reduce((acc, curr) => acc.flatMap((accItem) => curr.map((currItem) => [...accItem, currItem])), [[]])

  const combinations = cartesian(attributeValueOptions)

  const variantsToCreate = combinations.map((combination) => {
    const attributesMap = {}
    combination.forEach(({ key, value }) => {
      attributesMap[key] = value
    })

    return {
      templateId: template._id,
      variantName: Object.values(attributesMap).join(" / "),
      sku: `${template.skuPrefix || "VAR"}-${Date.now()}`, // You might want to improve SKU uniqueness here
      attributes: attributesMap,
      costPrice: template.costPrice || 0,
      sellingPrice: template.sellingPrice || 0,
      barcode,
    }
  })

  return models.ProductVariants.insertMany(variantsToCreate, { session })
}

/**
 * @desc    Restore a specific master data list for a tenant to its default state
 * @route   POST /api/v1/tenants/:id/master-data/restore
 * @access  Private (Super Admin)
 */
exports.restoreMasterData = asyncHandler(async (req, res, next) => {
  const { listName } = req.body
  const tenant = await Tenant.findById(req.params.id)

  if (!tenant) {
    return next(new Error(`Tenant not found`, 404))
  }

  const tenantDbConnection = await getTenantConnection(tenant.dbName)
  const models = getTenantModels(tenantDbConnection)

  try {
    let message = ""

    switch (listName) {
      case "brands":
        await models.Brand.deleteMany({})
        await models.Brand.insertMany(BRAND_MASTER_LIST)
        message = "Brand list restored."
        break
      case "categories":
        // Use dedicated session for categories
        const categorySession = await tenantDbConnection.startSession()
        try {
          await categorySession.withTransaction(async () => {
            await models.Category.deleteMany({}, { session: categorySession })
            await tenantProvisioningService.seedCategoriesRecursively(CATEGORY_MASTER_LIST, null, models, categorySession)
          })
          message = "Category list restored."
        } finally {
          categorySession.endSession()
        }
        break
      case "attributesAndSets":
        await models.Attribute.deleteMany({})
        await models.AttributeSet.deleteMany({})

        const createdAttributes = await models.Attribute.insertMany(ATTRIBUTE_MASTER_LIST)
        const attributeMap = new Map(createdAttributes.map((attr) => [attr.key, attr._id]))

        const attributeSetDocs = ATTRIBUTE_SET_MASTER_LIST.map((set) => ({
          name: set.name,
          attributes: set.attributeKeys.map((attrKey) => attributeMap.get(attrKey)),
        }))

        await models.AttributeSet.insertMany(attributeSetDocs)
        message = "Attributes and Sets restored."
        break
      case "devices":
        await models.Device.deleteMany({})
        await models.Device.insertMany(DEVICE_MASTER_LIST)
        message = "Device list restored."
        break
      case "warrantyPolicies":
        await models.WarrantyPolicy.deleteMany({})
        await models.WarrantyPolicy.insertMany(warrantyPolicyList)
        message = "Warranty Policy list restored."
        break
      case "qcChecklists":
        await models.QcChecklistTemplate.deleteMany({})
        await models.QcChecklistTemplate.insertMany(defaultQc)
        message = "QC Checklist list restored."
        break
      case "productTemplatesAndVariants":
        await _restoreProductsAndVariants(models)
        message = "Product Templates and Variants restored."
        break
      default:
        throw new Error(`Master list '${listName}' is not a valid restore target.`)
    }

    res.status(200).json({ success: true, message })
  } catch (error) {
    return next(new Error(`Failed to restore: ${error.message}`, 500))
  }
})

async function _restoreProductsAndVariants(models) {
  // 1. Reset collections first
  await models.ProductVariants.deleteMany({})
  await models.ProductTemplates.deleteMany({})
  console.log("Cleared existing product templates and variants")

  // Fetch prerequisite data
  const [brands, categories, attributeSets, accounts, devices] = await Promise.all([
    models.Brand.find().lean(),
    models.Category.find().lean(),
    models.AttributeSet.find().populate("attributes").lean(),
    models.Account.find().lean(),
    models.Device.find().lean(),
  ])

  // Create lookup maps
  const brandMap = new Map(brands.map((b) => [b.name, b._id]))
  const categoryMap = new Map(categories.map((c) => [c.name, c._id]))
  const attributeSetMap = new Map(attributeSets.map((a) => [a.name, a._id]))
  const accountMap = new Map(accounts.map((a) => [a.name, a._id]))
  const deviceMap = new Map(devices.map((d) => [d.name, d._id]))

  // Prepare template documents
  const templateDocs = PRODUCT_TEMPLATE_MASTER_LIST.map((template) => {
    const brandName = template.brandName && template.brandName !== "" ? template.brandName : "UNBRANDED"

    return {
      ...template,
      brandId: brandMap.get(brandName),
      categoryId: categoryMap.get(template.categoryName),
      attributeSetId: attributeSetMap.get(template.attributeSetName),
      deviceId: template.deviceName ? deviceMap.get(template.deviceName) : null,
      costPrice: template.costPrice || 0,
      sellingPrice: template.sellingPrice || 0,
      assetAccountId: accountMap.get(template.assetAccountName),
      revenueAccountId: accountMap.get(template.revenueAccountName),
      cogsAccountId: accountMap.get(template.cogsAccountName),
    }
  }).filter((t) => t.assetAccountId) // Ensure required account exists

  console.log(`Processing ${templateDocs.length} templates in batches...`)

  // Batch processing parameters
  const TEMPLATE_BATCH_SIZE = 50
  const VARIANT_BATCH_SIZE = 100
  const masterListMap = new Map(PRODUCT_TEMPLATE_MASTER_LIST.map((t) => [t.baseName, t]))

  // Global uniqueness trackers
  const globalSkuSet = new Set()
  const globalBarcodeSet = new Set()

  for (let i = 0; i < templateDocs.length; i += TEMPLATE_BATCH_SIZE) {
    const batchNumber = Math.floor(i / TEMPLATE_BATCH_SIZE) + 1
    console.log(`Processing template batch ${batchNumber}...`)

    const templateBatch = templateDocs.slice(i, i + TEMPLATE_BATCH_SIZE)
    const batchSession = await models.dbConnection.startSession()

    try {
      await batchSession.withTransaction(async () => {
        // Insert templates
        const createdTemplates = await models.ProductTemplates.insertMany(templateBatch, { session: batchSession })

        // Prepare all variants
        const allVariants = []

        for (const template of createdTemplates) {
          const originalTemplate = masterListMap.get(template.baseName)

          if (originalTemplate?.variants?.length) {
            for (const [variantIndex, variant] of originalTemplate.variants.entries()) {
              // Convert attributes array to object
              const attributesMap = {}
              variant.attributes.forEach((attr) => {
                attributesMap[attr.key] = attr.value
              })

              // Generate consistent variant name
              const nameParts = [template.baseName]
              const skuParts = [template.skuPrefix || "VAR"]

              // Sort attributes alphabetically by key
              Object.entries(attributesMap)
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .forEach(([key, value]) => {
                  nameParts.push(value)
                  skuParts.push(
                    value
                      .replace(/[^A-Z0-9]/gi, "")
                      .substring(0, 3)
                      .toUpperCase()
                  )
                })

              // Generate base SKU
              let baseSku = skuParts.join("-")
              let uniqueSku = baseSku
              let suffix = 1

              // Ensure GLOBAL SKU uniqueness
              while (globalSkuSet.has(uniqueSku)) {
                uniqueSku = `${baseSku}-${suffix}`
                suffix++
              }
              globalSkuSet.add(uniqueSku)

              // Handle barcode uniqueness
              let finalBarcode = variant.barcode
              if (finalBarcode) {
                if (globalBarcodeSet.has(finalBarcode)) {
                  console.warn(`Duplicate barcode ${finalBarcode} detected. Setting to null...`)
                  finalBarcode = null
                } else {
                  globalBarcodeSet.add(finalBarcode)
                }
              }

              const variantData = {
                templateId: template._id,
                variantName: nameParts.join(" - "),
                sku: uniqueSku,
                attributes: attributesMap,
                costPrice: template.costPrice || 0,
                sellingPrice: template.sellingPrice || 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              }

              if (finalBarcode) {
                variantData.barcode = finalBarcode
              }
              allVariants.push(variantData)
            }
          } else {
            // Generate unique default SKU
            let defaultSku = `${template.skuPrefix || "SKU"}-DEFAULT`
            let suffix = 1
            while (globalSkuSet.has(defaultSku)) {
              defaultSku = `${template.skuPrefix || "SKU"}-DEFAULT-${suffix}`
              suffix++
            }
            globalSkuSet.add(defaultSku)

            // Create default variant
            allVariants.push({
              templateId: template._id,
              variantName: template.baseName,
              sku: defaultSku,
              attributes: {},
              costPrice: template.costPrice || 0,
              sellingPrice: template.sellingPrice || 0,

              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        }

        // Insert variants in batches
        for (let v = 0; v < allVariants.length; v += VARIANT_BATCH_SIZE) {
          const variantBatch = allVariants.slice(v, v + VARIANT_BATCH_SIZE)
          await models.ProductVariants.insertMany(variantBatch, {
            session: batchSession,
          })
        }
      })
    } catch (batchError) {
      console.error(`Batch ${batchNumber} failed:`, batchError)
      throw new Error(`Batch processing failed: ${batchError.message}`)
    } finally {
      await batchSession.endSession()
    }
  }

  console.log("All template batches processed successfully.")
}

// @desc    Create a new tenant
// @route   POST /api/v1/tenants
// @access  Private (to be implemented)
exports.createTenantOld = asyncHandler(async (req, res, next) => {
  // In a real app, you might get the user from req.user to log who created it

  // Step 1: Create the tenant record in the admin database.
  const tenant = await Tenant.create(req.body)

  // Step 2: Provision the new database for this tenant.
  try {
    console.log(`Attempting to provision database for tenant: ${tenant.companyName}`)

    // The act of creating a connection will implicitly create the DB in MongoDB.
    const tenantDbConnection = await getTenantConnection(tenant.dbName)

    // Test the connection by pinging the admin database.
    // This confirms the connection is live before we proceed.
    const ping = await tenantDbConnection.db.admin().ping()
    if (!ping.ok) {
      throw new Error("Could not ping the newly created tenant database.")
    }

    console.log(`Database ${tenant.dbName} provisioned and connected successfully.`)

    // Once the connection is established, you could proceed to seed the database
    // with initial collections and data, like a 'users' collection with a default admin.
    // We will do this in the next chapter.

    // Close the connection as it's only needed for provisioning at this stage.
    // In later chapters, other services will manage connections for API requests.
    await tenantDbConnection.close()
  } catch (err) {
    console.error(`Failed to provision database for tenant ${tenant._id}. Rolling back.`, err)
    // This is a critical failure. Roll back the tenant creation to avoid an inconsistent state.
    await Tenant.findByIdAndDelete(tenant._id)
    // Pass a specific error to the error handler.
    return res.status(500).json({
      success: false,
      error: `Failed to provision tenant database: ${err.message}`,
    })
  }

  // Step 3: Respond to the client.
  res.status(201).json({
    success: true,
    data: tenant,
    message: "Tenant created and database provisioned successfully.",
  })
})

exports.createTenant = asyncHandler(async (req, res, next) => {
  const { tenantInfo, primaryBranch, owner } = req.body

  // Validate required parameters
  if (!tenantInfo?.subdomain || !primaryBranch || !owner) {
    return res.status(400).json({
      success: false,
      error: "Request body must include tenantInfo (with subdomain), primaryBranch, and owner objects.",
    })
  }

  const dbName = `tenant_${tenantInfo.subdomain.replace(/[^a-z0-9]/gi, "_")}`
  let tenantDbConnection
  let newTenant

  try {
    // 1. Create tenant database connection
    tenantDbConnection = await getTenantConnection(dbName)
    const models = getTenantModels(tenantDbConnection)

    // 2. Create primary branch
    const createdBranch = await models.Branch.create({
      ...primaryBranch,
      isPrimary: true,
    })

    // 3. Prepare initial data
    const initialData = {
      owner: {
        ...owner,
        assignedBranchId: createdBranch._id,
      },
    }

    // 4. Provision database (without top-level transaction)
    await tenantProvisioningService.provisionNewTenantDb(models, initialData)

    // 5. Create tenant record in admin DB
    newTenant = await Tenant.create({
      ...tenantInfo,
      dbName,
      status: "active",
    })

    res.status(201).json({
      success: true,
      data: newTenant,
      message: "Tenant created and provisioned successfully.",
    })
  } catch (err) {
    console.error(`CRITICAL: Tenant provisioning failed`, err)

    // Cleanup sequence
    const cleanupActions = []

    if (tenantDbConnection) {
      // Add DB cleanup first
      cleanupActions.push(
        tenantDbConnection.db
          .dropDatabase()
          .then(() => tenantDbConnection.close())
          .catch((cleanupErr) => console.error("Database cleanup failed:", cleanupErr))
      )
    }

    if (newTenant) {
      cleanupActions.push(
        Tenant.findByIdAndDelete(newTenant._id).catch((cleanupErr) => console.error("Tenant record cleanup failed:", cleanupErr))
      )
    }

    // Execute all cleanup in parallel
    await Promise.all(cleanupActions)

    // Determine error status
    const statusCode = err.name === "ValidationError" ? 400 : 500

    return res.status(statusCode).json({
      success: false,
      error: `Tenant provisioning failed: ${err.message}`,
      // Add debug info only in development
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
  }
})

exports.createTenant_old_2 = asyncHandler(async (req, res, next) => {
  const { tenantInfo, primaryBranch, owner } = req.body

  if (!tenantInfo || !primaryBranch || !owner) {
    return res.status(400).json({
      success: false,
      error: "Request body must include tenantInfo, primaryBranch, and owner objects.",
    })
  }
  if (!tenantInfo.enabledModules || !Array.isArray(tenantInfo.enabledModules)) {
    return res.status(400).json({ success: false, error: "enabledModules array is required." })
  }

  const existingTenant = await Tenant.findOne({
    $or: [{ subdomain: tenantInfo.subdomain }, { companyName: tenantInfo.companyName }],
  })
  if (existingTenant) {
    return res.status(400).json({
      success: false,
      error: "A tenant with that subdomain or company name already exists.",
    })
  }

  const dbName = `tenant_${tenantInfo.subdomain.replace(/-/g, "_")}`
  let tenantDbConnection
  let newTenant

  try {
    tenantDbConnection = await getTenantConnection(dbName)
    const models = getTenantModels(tenantDbConnection)
    const session = await tenantDbConnection.startSession()

    await session.withTransaction(async () => {
      // 1. Seed default accounts
      await accountingService.seedDefaultAccounts(models, session)

      // 2. Create the Primary Branch
      const branches = await models.Branch.create([{ ...primaryBranch, isPrimary: true }], {
        session,
      })
      const createdBranch = branches[0]

      // 3. Fetch master permissions list
      const allPermissions = await Permission.find({}).select("key").lean()
      const allPermissionKeys = allPermissions.map((p) => p.key)

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
          permissions: ["inventory:product:view", "sales:invoice:view_all", "settings:user:manage"],
          isDeletable: false,
          isSystemRole: true,
        },
        {
          name: "Cashier",
          description: "Performs sales and manages their shift.",
          permissions: ["sales:pos:access", "sales:invoice:view_own", "crm:customer:manage"],
          isDeletable: false,
          isSystemRole: true,
        },
      ]

      // --- THE FIX IS HERE ---
      // We now use insertMany and provide the required `ordered: true` option within the session options.
      const createdRoles = await models.Role.insertMany(rolesToCreate, {
        session,
        ordered: true,
      })
      const adminRole = createdRoles.find((r) => r.name === "Super Admin")

      if (!adminRole) throw new Error("Could not find Super Admin role after seeding.")

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
      )

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
      )

      // --- 4. ADD THIS NEW BLOCK ---
      // Seed default Brands and Categories
      console.log("Seeding master data: Brands and Categories...")

      await models.Brand.insertMany(
        BRAND_MASTER_LIST.map((b) => ({ name: b.name })),
        { session, ordered: true }
      )
      const createdCategories = await models.Category.insertMany(
        CATEGORY_MASTER_LIST.map((c) => ({ name: c.name })),
        { session, ordered: true }
      )
      const createdAttributes = await models.Attribute.insertMany(ATTRIBUTE_MASTER_LIST, {
        session,
        ordered: true,
      })
      const attributeIdMap = new Map()
      createdAttributes.forEach((attr) => {
        attributeIdMap.set(attr.key, attr._id)
      })

      const attributeSetsToCreate = ATTRIBUTE_SET_MASTER_LIST.map((set) => ({
        name: set.name,
        key: set.key || set.name.toLowerCase().replace(/\s+/g, "_"),
        attributes: set.attributeKeys.map((key) => attributeIdMap.get(key)).filter(Boolean), // Look up IDs from the map
      }))
      const createdAttributeSets = await models.AttributeSet.insertMany(attributeSetsToCreate, {
        session,
        ordered: true,
      })

      const categoryUpdatePromises = []
      const categoryMap = new Map(createdCategories.map((c) => [CATEGORY_MASTER_LIST.find((cm) => cm.name === c.name).key, c._id]))
      const attributeSetMap = new Map(
        createdAttributeSets.map((as) => [ATTRIBUTE_SET_MASTER_LIST.find((asm) => asm.name === as.name).categoryKey, as._id])
      )

      for (const [categoryKey, attributeSetId] of attributeSetMap.entries()) {
        const categoryId = categoryMap.get(categoryKey)
        if (categoryId) {
          categoryUpdatePromises.push(
            models.Category.updateOne({ _id: categoryId }, { $set: { attributeSetId: attributeSetId } }, { session })
          )
        }
      }
      await Promise.all(categoryUpdatePromises)

      console.log("✅ Master data seeded successfully.")
      // --- END OF NEW BLOCK ---
    })

    session.endSession()
    console.log(`Tenant DB ${dbName} provisioned successfully within a transaction.`)

    // 6. ONLY after the tenant DB is successfully provisioned, create the tenant record in the Admin DB.
    newTenant = await Tenant.create({ ...tenantInfo, dbName })

    res.status(201).json({
      success: true,
      data: newTenant,
      message: "Tenant created and provisioned successfully.",
    })
  } catch (err) {
    console.error(`CRITICAL: Failed during provisioning. Full cleanup required.`, err)

    if (tenantDbConnection) {
      await tenantDbConnection.db.dropDatabase()
    }
    if (newTenant) {
      // Should not happen with this logic, but a good safeguard
      await Tenant.findByIdAndDelete(newTenant._id)
    }

    return res.status(500).json({
      success: false,
      error: `Failed to provision tenant: ${err.message}`,
    })
  }
})

// @desc    Get all tenants
// @route   GET /api/v1/tenants
// @access  Private
// @desc    Get all tenants with pagination and filtering
// @route   GET /api/v1/admin/tenants
// @access  Private (Super Admin)
//

exports.getAllTenants = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 25, isActive, searchTerm } = req.query
  const skip = (page - 1) * limit

  // Dynamically build the filter object based on query params
  const filters = {}
  if (isActive) {
    filters.isActive = isActive === "true"
  }
  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i") // Case-insensitive search
    filters.$or = [{ companyName: regex }, { subdomain: regex }]
  }

  // Execute queries for data and total count in parallel for efficiency
  const [tenants, total] = await Promise.all([
    Tenant.find(filters).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Tenant.countDocuments(filters),
  ])

  const totalPages = Math.ceil(total / limit)

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages,
      limit: Number(limit),
      count: tenants.length,
    },
    data: tenants,
  })
})

// @desc    Get a single tenant by ID
// @route   GET /api/v1/tenants/:id
// @access  Private
exports.getTenantById = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id).lean()

  if (!tenant) {
    // This check is important for a user-friendly error message.
    return res.status(404).json({
      success: false,
      error: `Tenant not found with id of ${req.params.id}`,
    })
  }

  const tenantDbConn = await getTenantConnection(tenant.dbName)
  const { Branch, User } = getTenantModels(tenantDbConn)

  // 2. Fetch branches and users from this tenant's DB
  const branches = await Branch.find().lean()
  const users = await User.find().lean()

  res.status(200).json({
    success: true,
    data: { ...tenant, branches, users },
  })
})

// @desc    Delete a tenant
// @route   DELETE /api/v1/tenants/:id
// @access  Private

// @desc    Delete a tenant
// @route   DELETE /api/v1/tenants/:id
// @access  Private
exports.deleteTenant = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id)

  if (!tenant) {
    return res.status(404).json({
      success: false,
      error: `Tenant not found with id of ${req.params.id}`,
    })
  }

  // This is a destructive operation. We wrap it in a try/catch block.
  try {
    // 1. Get a temporary connection to the tenant's database.
    const tenantDbConnection = await getTenantConnection(tenant.dbName)

    // 2. Issue the command to drop the entire database.
    await tenantDbConnection.db.dropDatabase()
    console.log(`Successfully dropped database: ${tenant.dbName}`)

    // 3. Close the temporary connection.
    await tenantDbConnection.close()

    // 4. ONLY after the database is successfully dropped, delete the tenant's
    //    record from the central admin database.
    await tenant.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
      message: `Tenant "${tenant.companyName}" and all associated data have been permanently deleted.`,
    })
  } catch (error) {
    console.error(`Failed to delete tenant database for ${tenant.companyName}:`, error)
    return res.status(500).json({
      success: false,
      error: "Failed to delete tenant database. The tenant record was not removed. Please check server logs.",
    })
  }
})

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
  }

  // 2. Remove any keys that were not provided in the request body.
  // This prevents accidentally overwriting existing fields with `undefined`.
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key]
    }
  })

  // 3. Perform a single, efficient, and secure update call.
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  // 4. Handle the "not found" case.
  if (!tenant) {
    return res.status(404).json({ success: false, error: `Tenant not found` })
  }

  res.status(200).json({ success: true, data: tenant })
})

// @desc    Update a tenant's enabled modules
// @route   PUT /api/v1/tenants/:id/modules
// @access  Private (Super Admin)
exports.updateTenantModules = asyncHandler(async (req, res, next) => {
  const { modules } = req.body

  // Basic validation
  if (!Array.isArray(modules)) {
    return res.status(400).json({ success: false, error: "Modules must be provided as an array." })
  }

  // --- NEW VALIDATION STEP ---
  const availableModules = await Module.find({
    key: { $in: modules },
    isGloballyActive: true,
  })
  if (availableModules.length !== modules.length) {
    return res.status(400).json({
      success: false,
      error: "Request contains invalid or inactive modules.",
    })
  }
  // --- END VALIDATION ---

  const tenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { $set: { enabledModules: modules } }, // Use $set for a targeted update
    { new: true, runValidators: true }
  )

  if (!tenant) {
    return res.status(404).json({ success: false, error: "Tenant not found." })
  }

  res.status(200).json({ success: true, data: tenant })
})
