// Master Data Lists
const BRAND_MASTER_LIST = require("../modules/admin/constants/brand.masterlist")
const CATEGORY_MASTER_LIST = require("../modules/admin/constants/category.masterlist")
const ATTRIBUTE_MASTER_LIST = require("../modules/admin/constants/attribute.masterlist")
const ATTRIBUTE_SET_MASTER_LIST = require("../modules/admin/constants/attributeSet.masterlist")
const PRODUCT_TEMPLATE_MASTER_LIST = require("../modules/admin/constants/productTemplate.masterlist")
const DEFAULT_ACCOUNTS_LIST = require("../modules/admin/constants/account.masterlist")
const CURRENCY_MASTER_LIST = require("../modules/admin/constants/currency.masterlist")
const EXCHANGE_RATE_MASTER_LIST = require("../modules/admin/constants/exchangeRate.masterlist")
const PAYMENT_METHOD_MASTER_LIST = require("../modules/admin/constants/paymentMethod.masterlist")
const PRODUCT_VARIANT_MASTER_LIST = require("../modules/admin/constants/productVarients.masterlist")
const DEVICE_MASTER_LIST = require("../modules/admin/constants/device.masterlist")
const defaultNotificationTemplates = require("../modules/admin/constants/notificationTemplates.masterlist")
const customerService = require("./customer.service")
const defaultLabelTemplates = require("../modules/admin/constants/labelTemplates.masterlist")
const defaultTemplates = require("../modules/admin/constants/defaultTemplates")
const warrantyPolicyList = require("../modules/admin/constants/warrantyPolicy.masterlist")
const defaultQc = require("../modules/admin/constants/qc.masterlist")

// class TenantProvisioningService {
//   /**
//    * Orchestrates the entire seeding process for a new tenant's database within a transaction.
//    * @param {object} models - The Mongoose models compiled for the tenant's connection.
//    * @param {mongoose.ClientSession} session - The Mongoose session for the transaction.
//    * @param {object} initialData - Contains owner and primaryBranch data.
//    */
//   async provisionNewTenantDb(models, session, initialData) {
//     console.log(`[Provisioning Service] Starting database setup...`)

//     // 1. Seed financial accounts first, as they are dependencies for other records.
//     await this._seedAccounts(models, session)

//     // 2. Seed system data like roles and the default 'Walking Customer'.
//     const { adminRole } = await this._seedSystemData(models, session)

//     // 3. Seed the owner's user account, linking it to the newly created role and branch.
//     await this._seedOwnerAccount(models, session, initialData, adminRole)

//     const [accounts] = await Promise.all([models.Account.find({}).session(session)])

//     const accountMap = new Map(accounts.map((a) => [a.name, a._id]))

//     const paymentMethodsToCreate = PAYMENT_METHOD_MASTER_LIST.map((method) => ({
//       ...method,
//       linkedAccountId: accountMap.get(method.linkedAccountName),
//       holdingAccountId: method.holdingAccountName ? accountMap.get(method.holdingAccountName) : null,
//     }))
//     await models.PaymentMethod.insertMany(paymentMethodsToCreate, {
//       session,
//       ordered: true,
//     })

//     console.log("Seeding master data: Currencies and Exchange Rates...")
//     await models.Currency.insertMany(CURRENCY_MASTER_LIST, { session, ordered: true })
//     await models.ExchangeRate.insertMany(EXCHANGE_RATE_MASTER_LIST, {
//       session,
//       ordered: true,
//     })
//     console.log("Currency data seeded successfully.")

//     // 4. Seed master data for inventory management.
//     await this._seedMasterData(models, session)

//     //await this._seedDevicesAndRepairs(models, session)

//     // 5. Seed Product Variants, linking them to the newly created templates.
//     // await this._seedProductVariants(models, session);

//     console.log(`[Provisioning Service] Database setup complete.`)
//   }

//   /**
//    * Seeds the default Chart of Accounts.
//    * @private
//    */
//   async _seedAccounts(models, session) {
//     const { Account } = models
//     await Account.insertMany(DEFAULT_ACCOUNTS_LIST, { session })
//     console.log(`  -> Default Chart of Accounts seeded.`)
//   }

//   /**
//    * Seeds default Roles and the system-created 'Walking Customer'.
//    * @private
//    * @returns {object} The created Super Admin role document.
//    */
//   async _seedSystemData(models, session) {
//     const { Role, Permission } = models

//     // Note: For full modularity, Permission should also be a tenant-level model.
//     // Assuming it's available for now. If it's an admin model, it needs to be fetched outside the transaction.
//     const allPermissions = await require("../modules/admin/permissions/permission.model").find({}).select("key").lean()
//     const allPermissionKeys = allPermissions.map((p) => p.key)

//     const rolesToCreate = [
//       {
//         name: "Super Admin",
//         permissions: allPermissionKeys,
//         isSystemRole: true,
//       },
//       {
//         name: "Manager",
//         permissions: ["inventory:product:view", "sales:invoice:view_all"],
//         isSystemRole: true,
//       },
//       {
//         name: "Cashier",
//         permissions: ["sales:pos:access", "crm:customer:manage"],
//         isSystemRole: true,
//       },
//     ]

//     const createdRoles = await Role.insertMany(rolesToCreate, { session })
//     console.log(`  -> Default Roles seeded.`)

//     await customerService.createCustomerWithLedger(
//       models,
//       {
//         isSystemCreated: true,
//         name: "Walking Customer",
//         phone: "000-000-0000",
//       },
//       session
//     )
//     console.log(`  -> Default 'Walking Customer' created.`)

//     const adminRole = createdRoles.find((r) => r.name === "Super Admin")
//     if (!adminRole) throw new Error("Super Admin role was not created during seeding.")
//     return { adminRole }
//   }

//   /**
//    * Seeds the primary owner's user account.
//    * @private
//    */
//   async _seedOwnerAccount(models, session, { owner }, adminRole) {
//     const { User, Branch } = models
//     // In a real transactional implementation, the branch should be created here too.
//     // For now, we assume it's passed in.
//     await User.create(
//       [
//         {
//           name: owner.name,
//           email: owner.email,
//           password: owner.password,
//           role: adminRole._id,
//           assignedBranchId: owner.assignedBranchId, // This needs to be the ID of the just-created branch
//         },
//       ],
//       { session }
//     )
//     console.log(`  -> Owner account created.`)
//   }

//   /**
//    * Seeds all master data related to inventory (Brands, Categories, Products, etc.).
//    * @private
//    */
//   async _seedMasterData(models, session) {
//     const {
//       Brand,
//       Category,
//       Attribute,
//       AttributeSet,
//       ProductTemplates,
//       ProductVariants,
//       Account,
//       Currency,
//       ExchangeRate,
//       PaymentMethod,
//       NotificationTemplate,
//       LabelTemplate,
//       Device,
//     } = models

//     // Seed simple lists
//     await Brand.insertMany(
//       BRAND_MASTER_LIST.map((b) => (b.name ? { name: b.name } : b)),
//       { session }
//     )

//     // // Seed hierarchical categories
//     // for (const cat of CATEGORY_MASTER_LIST) {
//     //   const [parentDoc] = await Category.create(
//     //     [{ name: cat.name, description: cat.description }],
//     //     {
//     //       session,
//     //     }
//     //   );
//     //   if (cat.children && cat.children.length > 0) {
//     //     await Category.insertMany(
//     //       cat.children.map((child) => ({
//     //         name: child.name,
//     //         parentId: parentDoc._id,
//     //       })),
//     //       { session }
//     //     );
//     //   }
//     // }

//     await models.WarrantyPolicy.insertMany(warrantyPolicyList, { session })
//     await models.QcChecklistTemplate.insertMany(defaultQc, { session })
//     await NotificationTemplate.insertMany(defaultNotificationTemplates, { session })
//     await LabelTemplate.insertMany(defaultLabelTemplates, { session })
//     await models.DocumentTemplate.insertMany(defaultTemplates, { session })
//     // Seed hierarchical categories using the new recursive function
//     console.log("Seeding hierarchical categories...")
//     await this.seedCategoriesRecursively(CATEGORY_MASTER_LIST, null, models, session)
//     console.log(" -> Categories seeded successfully.")

//     // Seed Attributes and Sets
//     const createdAttributes = await Attribute.insertMany(ATTRIBUTE_MASTER_LIST, { session })
//     const attributeMap = new Map(createdAttributes.map((attr) => [attr.key, attr._id]))
//     const attributeSetDocs = ATTRIBUTE_SET_MASTER_LIST.map((set) => ({
//       name: set.name,
//       key: set.key || set.name.toLowerCase().replace(/\s+/g, "_"),
//       attributes: set.attributeKeys.map((key) => attributeMap.get(key)).filter(Boolean),
//     }))
//     await AttributeSet.insertMany(attributeSetDocs, { session })

//     // Seed Product Templates
//     const [brands, categories, attributeSets, accounts, devices] = await Promise.all([
//       Brand.find({}).session(session),
//       Category.find({}).session(session),
//       AttributeSet.find({}).session(session),
//       Account.find({}).session(session),
//       Device.find({}).session(session),
//     ])
//     const brandMap = new Map(brands.map((b) => [b.name, b._id]))
//     const categoryMap = new Map(categories.map((c) => [c.name, c._id]))
//     const attributeSetMap = new Map(attributeSets.map((a) => [a.name, a._id]))
//     const accountMap = new Map(accounts.map((a) => [a.name, a._id]))
//     const deviceMap = new Map(devices.map((d) => [d.name, d._id]))

//     console.log("PRODUCT_TEMPLATE_MASTER_LIST size ", PRODUCT_TEMPLATE_MASTER_LIST.length)
//     const templateDocs = PRODUCT_TEMPLATE_MASTER_LIST.map((template) => {
//       const attrSetId = attributeSetMap.get(template.attributeSetName)
//       if (template.attributeSetName && !attrSetId) {
//         console.warn(`⚠️ AttributeSet "${template.attributeSetName}" not found for:`, template.baseName)
//       }
//       const deviceId = template.deviceName ? deviceMap.get(template.deviceName) : null
//       const brandName = template.brandName && template.brandName != "" ? template.brandName : "UNBRANDED"
//       return {
//         ...template,
//         brandId: brandMap.get(brandName),
//         categoryId: categoryMap.get(template.categoryName),
//         attributeSetId: attrSetId, // could be undefined
//         costPrice: 0,
//         sellingPrice: 0,
//         deviceId: deviceId,
//         assetAccountId: accountMap.get(template.assetAccountName),
//         revenueAccountId: accountMap.get(template.revenueAccountName),
//         cogsAccountId: accountMap.get(template.cogsAccountName),
//       }
//     }).filter((t) => t.assetAccountId)

//     console.log("Total templates to process:", templateDocs.length)

//     // ======================================================================
//     // BATCH PROCESSING FOR BOTH TEMPLATES AND VARIANTS
//     // ======================================================================
//     const TEMPLATE_BATCH_SIZE = 100 // How many templates to process per transaction
//     const VARIANT_BATCH_SIZE = 100 // How many variants to insert at a time
//     const masterListMap = new Map(PRODUCT_TEMPLATE_MASTER_LIST.map((t) => [t.baseName, t]))

//     // --- Outer Loop: Process templates in batches ---
//     for (let i = 0; i < templateDocs.length; i += TEMPLATE_BATCH_SIZE) {
//       const templateBatch = templateDocs.slice(i, i + TEMPLATE_BATCH_SIZE)
//       console.log(`Processing template batch ${Math.floor(i / TEMPLATE_BATCH_SIZE) + 1}...`)

//       const batchSession = await models.ProductTemplates.db.startSession()
//       try {
//         await batchSession.withTransaction(async () => {
//           // 1. Create the templates for this batch
//           const createdTemplates = await ProductTemplates.insertMany(templateBatch, { session: batchSession })

//           // 2. Collect ALL variants for the templates created in this batch
//           const allVariantsInBatch = []
//           for (const createdTemplate of createdTemplates) {
//             const originalTemplate = masterListMap.get(createdTemplate.baseName)
//             if (!originalTemplate) continue

//             if (originalTemplate.variants && originalTemplate.variants.length > 0) {
//               originalTemplate.variants.forEach((variant) => {
//                 allVariantsInBatch.push({
//                   templateId: createdTemplate._id,
//                   sku: `${createdTemplate.skuPrefix || "SKU"}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
//                   attributes: variant.attributes,
//                   costPrice: createdTemplate.costPrice,
//                   sellingPrice: createdTemplate.sellingPrice,
//                 })
//               })
//             } else {
//               // If a template has no pre-defined variants, create its default one immediately
//               await ProductVariants.createDefaultVariant(createdTemplate, batchSession)
//             }
//           }

//           // 3. --- Inner Loop: Insert the collected variants in smaller batches ---
//           if (allVariantsInBatch.length > 0) {
//             console.log(` -> Inserting ${allVariantsInBatch.length} variants in chunks of ${VARIANT_BATCH_SIZE}...`)
//             for (let j = 0; j < allVariantsInBatch.length; j += VARIANT_BATCH_SIZE) {
//               const variantChunk = allVariantsInBatch.slice(j, j + VARIANT_BATCH_SIZE)
//               await ProductVariants.insertMany(variantChunk, { session: batchSession })
//             }
//           }
//         })
//       } finally {
//         await batchSession.endSession()
//       }
//     }

//     console.log("All batches processed successfully.")

//     // let createdTemplates = []
//     // if (templateDocs.length > 0) {
//     //   // 1. Create the templates and store the result
//     //   createdTemplates = await ProductTemplates.insertMany(templateDocs, { session })
//     // }

//     // console.log("createdTemplates size ", createdTemplates.length)

//     // // 2. Loop through each newly created template.
//     // for (const template of createdTemplates) {
//     //   // console.log("template ", template)

//     //   const attributeSet = template.attributeSetId
//     //     ? await AttributeSet.findById(template.attributeSetId).populate("attributes").session(session)
//     //     : null

//     //   if (!attributeSet?.attributes) {
//     //     console.warn(`⚠️ Template "${template.baseName}" has no attributeSetId`)
//     //   }
//     //   if (!attributeSet || attributeSet.attributes.length === 0) {
//     //     await ProductVariants.createDefaultVariant(template, session)
//     //   } else {
//     //     await ProductVariants.createDefaultVariant(template, session)
//     //     // await ProductVariants.createVariantsFromAttributes(template, attributeSet, session);
//     //   }

//     //   // const populatedTemplate = await ProductTemplates.findById(template._id).populate({
//     //   //   path: "attributeSetId",
//     //   //   populate: { path: "attributes" }, // populate the `attributes` inside attributeSet
//     //   // });
//     // }

//     // Seed Payment Methods, linking them to the correct accounts

//     console.log(`  -> Master Inventory data seeded.`)
//   }

//   /**
//    * A recursive helper function to seed a category and all its descendants.
//    * This is the correct, professional way to handle a nested structure.
//    * @param {Array} categoryNodes - The array of category objects to process.
//    * @param {mongoose.Types.ObjectId | null} parentId - The ID of the parent for this level.
//    * @param {object} models - The collection of Mongoose models.
//    * @param {mongoose.ClientSession} session - The active transaction session.
//    */
//   async seedCategoriesRecursively(categoryNodes, parentId, models, session) {
//     const { Category } = models

//     // Prepare all documents for the current level
//     const categoriesToCreate = categoryNodes.map((node) => ({
//       name: node.name,
//       description: node.description,
//       parent: parentId, // Use 'parent' to match our final schema
//     }))

//     // Create all categories at the current level in a single batch
//     const createdCategories = await Category.insertMany(categoriesToCreate, { session })

//     // Now, for each newly created category, check if it has children and recurse
//     for (let i = 0; i < createdCategories.length; i++) {
//       const parentDoc = createdCategories[i]
//       const sourceNode = categoryNodes[i] // The original node from the master list

//       if (sourceNode.children && sourceNode.children.length > 0) {
//         // If children exist, call the function again for the next level down
//         await this.seedCategoriesRecursively(sourceNode.children, parentDoc._id, models, session)
//       }
//     }
//   }

//   /**
//    * Seed devices and linked repair types.
//    * @param {*} models
//    * @param {*} session
//    */
//   async _seedDevicesAndRepairs(models, session) {
//     const { Device, RepairType, Brand, Category } = models

//     // Example Device list (extend as needed)
//     const devices = DEVICE_MASTER_LIST
//     // Example Repairs list (common repairs for smartphones)
//     const commonRepairs = [
//       "Screen Replacement",
//       "Battery Replacement",
//       "Charging Port Repair",
//       "Camera Repair",
//       "Speaker/Mic Repair",
//       "Button Repair",
//       "Water Damage Treatment",
//     ]

//     // Lookup brand and category documents
//     const brandMap = new Map()
//     const categoryMap = new Map()

//     // Cache all brands & categories to avoid repeated queries
//     const allBrands = await Brand.find({}).session(session)
//     allBrands.forEach((b) => brandMap.set(b.name, b._id))

//     const allCategories = await Category.find({}).session(session)
//     allCategories.forEach((c) => categoryMap.set(c.name, c._id))

//     for (const deviceData of devices) {
//       const brandId = brandMap.get(deviceData.brandName)
//       const categoryId = categoryMap.get(deviceData.categoryName)

//       if (!brandId || !categoryId) {
//         console.warn(`Skipping device ${deviceData.name} - brand or category missing.`)
//         continue
//       }

//       // Check if device already exists
//       let device = await Device.findOne({ name: deviceData.name, brandId }).session(session)
//       if (!device) {
//         device = new Device({
//           name: deviceData.name,
//           brandId,
//           categoryId,
//           isActive: true,
//         })
//         await device.save({ session })
//         console.log(`Created device: ${device.name}`)
//       } else {
//         console.log(`Device already exists: ${device.name}`)
//       }

//       // Seed repair types for this device
//       for (const repairName of commonRepairs) {
//         // Build a unique repair type name: "DeviceName - RepairName"
//         const repairTypeName = `${device.name} - ${repairName}`

//         // Check if this repair type already exists for this device
//         const exists = await RepairType.findOne({
//           name: repairTypeName,
//           deviceId: device._id,
//         }).session(session)
//         if (exists) continue

//         const repairType = new RepairType({
//           name: repairTypeName,
//           deviceId: device._id,
//           description: repairName,
//           isActive: true,
//         })

//         await repairType.save({ session })
//         console.log(`Created repair type: ${repairType.name}`)
//       }
//     }

//     console.log("Device and Repair Type seeding complete.")
//   }

//   /**
//    * Seeds all product variants and links them to their parent templates.
//    * MUST be run AFTER _seedMasterData.
//    * This version is corrected to handle case-insensitivity for template lookups.
//    * @private
//    */
//   async _seedProductVariants(models, session) {
//     const { ProductTemplates, ProductVariants } = models

//     // 1. Fetch all templates that were just created.
//     const allTemplates = await ProductTemplates.find({}).populate("brandId").session(session).lean()
//     if (!allTemplates.length) {
//       console.log(" -> No product templates found, skipping variant seeding.")
//       return
//     }

//     // 2. Create a fast, case-insensitive lookup map.
//     // The key is now always uppercase: 'BASENAME|BRANDNAME'
//     const templateMap = new Map()
//     for (const template of allTemplates) {
//       if (template.baseName && template.brandId?.name) {
//         const key = `${template.baseName.toUpperCase()}|${template.brandId.name.toUpperCase()}`
//         templateMap.set(key, template._id)
//       }
//     }

//     // 3. Prepare the variant documents for insertion.
//     const variantsToCreate = []
//     for (const variant of PRODUCT_VARIANT_MASTER_LIST) {
//       // --- DEFINITIVE FIX IS HERE ---
//       // We now split the variant's templateKey and convert its parts to uppercase
//       // to ensure a case-insensitive match with our map.
//       const keyParts = variant.templateKey.split("|")
//       const lookupKey = `${keyParts[0].toUpperCase()}|${keyParts[1].toUpperCase()}`

//       const templateId = templateMap.get(lookupKey)

//       if (templateId) {
//         variantsToCreate.push({
//           templateId: templateId,
//           variantName: variant.variantName,
//           sku: `${variant.skuPrefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
//           attributes: variant.attributes,
//           images: variant.images,
//           costPrice: 0,
//           sellingPrice: 0,
//         })
//       } else {
//         console.warn(
//           ` -> [Warning] Could not find parent template for key: "${variant.templateKey}". Skipping variant: "${variant.variantName}"`
//         )
//       }
//     }

//     // 4. Insert all variants in a single batch.
//     if (variantsToCreate.length > 0) {
//       await ProductVariants.insertMany(variantsToCreate, { session })
//     }

//     console.log(` -> ${variantsToCreate.length} Product Variants seeded successfully.`)
//   }
// }

// module.exports = new TenantProvisioningService()

class TenantProvisioningService {
  /**
   * Orchestrates the entire seeding process without a top-level transaction
   */
  async provisionNewTenantDb(models, initialData) {
    console.log(`[Provisioning Service] Starting database setup...`)

    // Execute seeding steps independently
    await this._seedAccounts(models)
    const { adminRole } = await this._seedSystemData(models)
    await this._seedOwnerAccount(models, initialData, adminRole)

    // Seed payment methods after accounts
    const accounts = await models.Account.find({})
    const accountMap = new Map(accounts.map((a) => [a.name, a._id]))
    const paymentMethods = PAYMENT_METHOD_MASTER_LIST.map((method) => ({
      ...method,
      linkedAccountId: accountMap.get(method.linkedAccountName),
      holdingAccountId: method.holdingAccountName ? accountMap.get(method.holdingAccountName) : null,
    }))
    await models.PaymentMethod.insertMany(paymentMethods)

    // Seed currency data
    await models.Currency.insertMany(CURRENCY_MASTER_LIST)
    await models.ExchangeRate.insertMany(EXCHANGE_RATE_MASTER_LIST)

    // Seed core master data
    await this._seedMasterData(models)

    console.log(`[Provisioning Service] Database setup complete.`)
  }

  async _seedAccounts(models) {
    await models.Account.insertMany(DEFAULT_ACCOUNTS_LIST)
    console.log(`  -> Default Chart of Accounts seeded.`)
  }

  async _seedSystemData(models) {
    const { Role } = models
    const Permission = require("../modules/admin/permissions/permission.model")

    const allPermissions = await Permission.find({}).select("key").lean()
    const allPermissionKeys = allPermissions.map((p) => p.key)

    const rolesToCreate = [
      {
        name: "Super Admin",
        permissions: allPermissionKeys,
        isSystemRole: true,
      },
      // ... other roles ...
    ]

    const createdRoles = await Role.insertMany(rolesToCreate)
    console.log(`  -> Default Roles seeded.`)

    // Create walking customer without session
    await this._createWalkingCustomer(models)

    const adminRole = createdRoles.find((r) => r.name === "Super Admin")
    return { adminRole }
  }

  async _createWalkingCustomer(models) {
    const customerData = {
      isSystemCreated: true,
      name: "Walking Customer",
      phone: "000-000-0000",
    }
    // Assuming customerService is refactored to work without sessions
    await customerService.createCustomerWithLedger(models, customerData)
    console.log(`  -> Default 'Walking Customer' created.`)
  }

  async _seedOwnerAccount(models, { owner }, adminRole) {
    await models.User.create({
      name: owner.name,
      email: owner.email,
      password: owner.password,
      role: adminRole._id,
      assignedBranchId: owner.assignedBranchId,
    })
    console.log(`  -> Owner account created.`)
  }

  async _seedMasterData(models) {
    // 1. Seed standalone collections
    await this._seedStaticCollections(models)

    // 2. Seed hierarchical categories
    console.log("Seeding hierarchical categories...")
    await this.seedCategoriesRecursively(CATEGORY_MASTER_LIST, null, models)
    console.log(" -> Categories seeded successfully.")

    // 3. Seed attributes and sets
    await this._seedAttributesAndSets(models)

    // 4. Seed product templates and variants in batches
    await this._seedProductTemplatesAndVariants(models)

    console.log(`  -> Master Inventory data seeded.`)
  }

  async _seedStaticCollections(models) {
    await models.Brand.insertMany(BRAND_MASTER_LIST)
    await models.WarrantyPolicy.insertMany(warrantyPolicyList)
    await models.QcChecklistTemplate.insertMany(defaultQc)
    await models.NotificationTemplate.insertMany(defaultNotificationTemplates)
    await models.LabelTemplate.insertMany(defaultLabelTemplates)
    await models.DocumentTemplate.insertMany(defaultTemplates)
  }

  async _seedAttributesAndSets(models) {
    const createdAttributes = await models.Attribute.insertMany(ATTRIBUTE_MASTER_LIST)
    const attributeMap = new Map(createdAttributes.map((attr) => [attr.key, attr._id]))

    const attributeSetDocs = ATTRIBUTE_SET_MASTER_LIST.map((set) => ({
      name: set.name,
      key: set.key || set.name.toLowerCase().replace(/\s+/g, "_"),
      attributes: set.attributeKeys.map((key) => attributeMap.get(key)).filter(Boolean),
    }))

    await models.AttributeSet.insertMany(attributeSetDocs)
  }

  async _seedProductTemplatesAndVariants(models) {
    // Fetch prerequisite data
    const [brands, categories, attributeSets, accounts, devices] = await Promise.all([
      models.Brand.find(),
      models.Category.find(),
      models.AttributeSet.find(),
      models.Account.find(),
      models.Device.find(),
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
        costPrice: 0,
        sellingPrice: 0,
        assetAccountId: accountMap.get(template.assetAccountName),
        revenueAccountId: accountMap.get(template.revenueAccountName),
        cogsAccountId: accountMap.get(template.cogsAccountName),
      }
    }).filter((t) => t.assetAccountId) // Ensure required account exists

    console.log(`Processing ${templateDocs.length} templates in batches...`)

    // Batch processing parameters
    const TEMPLATE_BATCH_SIZE = 100
    const VARIANT_BATCH_SIZE = 200
    const masterListMap = new Map(PRODUCT_TEMPLATE_MASTER_LIST.map((t) => [t.baseName, t]))

    for (let i = 0; i < templateDocs.length; i += TEMPLATE_BATCH_SIZE) {
      const batchNumber = Math.floor(i / TEMPLATE_BATCH_SIZE) + 1
      console.log(`Processing template batch ${batchNumber}...`)

      const templateBatch = templateDocs.slice(i, i + TEMPLATE_BATCH_SIZE)

      // Use isolated session per batch
      const batchSession = await models.connection.startSession()
      try {
        await batchSession.withTransaction(async () => {
          // Insert templates
          const createdTemplates = await models.ProductTemplates.insertMany(templateBatch, { session: batchSession })

          // Process variants
          const variantBatches = []
          for (const template of createdTemplates) {
            const originalTemplate = masterListMap.get(template.baseName)
            if (!originalTemplate?.variants?.length) {
              // Create default variant if none defined
              await models.ProductVariants.createDefaultVariant(template, batchSession)
              continue
            }

            // Prepare variants for batch insert
            const variants = originalTemplate.variants.map((v) => ({
              templateId: template._id,
              sku: `${template.skuPrefix || "SKU"}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
              attributes: v.attributes,
              costPrice: 0,
              sellingPrice: 0,
            }))

            variantBatches.push(...this._chunkArray(variants, VARIANT_BATCH_SIZE))
          }

          // Insert all variant batches
          for (const variantBatch of variantBatches) {
            await models.ProductVariants.insertMany(variantBatch, {
              session: batchSession,
            })
          }
        })
      } finally {
        await batchSession.endSession()
      }
    }
    console.log("All template batches processed successfully.")
  }

  // Utility function to chunk arrays
  _chunkArray(array, size) {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  async seedCategoriesRecursively(categoryNodes, parentId, models) {
    const { Category } = models
    const categoriesToCreate = categoryNodes.map((node) => ({
      name: node.name,
      description: node.description,
      parent: parentId,
    }))

    const createdCategories = await Category.insertMany(categoriesToCreate)

    for (let i = 0; i < createdCategories.length; i++) {
      const parentDoc = createdCategories[i]
      const sourceNode = categoryNodes[i]

      if (sourceNode.children?.length) {
        await this.seedCategoriesRecursively(sourceNode.children, parentDoc._id, models)
      }
    }
  }
}

module.exports = new TenantProvisioningService()
