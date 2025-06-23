// Master Data Lists
const BRAND_MASTER_LIST = require("../modules/admin/constants/brand.masterlist");
const CATEGORY_MASTER_LIST = require("../modules/admin/constants/category.masterlist");
const ATTRIBUTE_MASTER_LIST = require("../modules/admin/constants/attribute.masterlist");
const ATTRIBUTE_SET_MASTER_LIST = require("../modules/admin/constants/attributeSet.masterlist");
const PRODUCT_TEMPLATE_MASTER_LIST = require("../modules/admin/constants/productTemplate.masterlist");
const DEFAULT_ACCOUNTS_LIST = require("../modules/admin/constants/account.masterlist");

const customerService = require("./customer.service");

class TenantProvisioningService {
  /**
   * Orchestrates the entire seeding process for a new tenant's database within a transaction.
   * @param {object} models - The Mongoose models compiled for the tenant's connection.
   * @param {mongoose.ClientSession} session - The Mongoose session for the transaction.
   * @param {object} initialData - Contains owner and primaryBranch data.
   */
  async provisionNewTenantDb(models, session, initialData) {
    console.log(`[Provisioning Service] Starting database setup...`);

    // 1. Seed financial accounts first, as they are dependencies for other records.
    await this._seedAccounts(models, session);

    // 2. Seed system data like roles and the default 'Walking Customer'.
    const { adminRole } = await this._seedSystemData(models, session);

    // 3. Seed the owner's user account, linking it to the newly created role and branch.
    await this._seedOwnerAccount(models, session, initialData, adminRole);

    // 4. Seed master data for inventory management.
    await this._seedMasterData(models, session);

    console.log(`[Provisioning Service] Database setup complete.`);
  }

  /**
   * Seeds the default Chart of Accounts.
   * @private
   */
  async _seedAccounts(models, session) {
    const { Account } = models;
    await Account.insertMany(DEFAULT_ACCOUNTS_LIST, { session });
    console.log(`  -> Default Chart of Accounts seeded.`);
  }

  /**
   * Seeds default Roles and the system-created 'Walking Customer'.
   * @private
   * @returns {object} The created Super Admin role document.
   */
  async _seedSystemData(models, session) {
    const { Role, Permission } = models;

    // Note: For full modularity, Permission should also be a tenant-level model.
    // Assuming it's available for now. If it's an admin model, it needs to be fetched outside the transaction.
    const allPermissions =
      await require("../modules/admin/permissions/permission.model")
        .find({})
        .select("key")
        .lean();
    const allPermissionKeys = allPermissions.map((p) => p.key);

    const rolesToCreate = [
      {
        name: "Super Admin",
        permissions: allPermissionKeys,
        isSystemRole: true,
      },
      {
        name: "Manager",
        permissions: ["inventory:product:view", "sales:invoice:view_all"],
        isSystemRole: true,
      },
      {
        name: "Cashier",
        permissions: ["sales:pos:access", "crm:customer:manage"],
        isSystemRole: true,
      },
    ];

    const createdRoles = await Role.insertMany(rolesToCreate, { session });
    console.log(`  -> Default Roles seeded.`);

    await customerService.createCustomerWithLedger(
      models,
      {
        isSystemCreated: true,
        name: "Walking Customer",
        phone: "000-000-0000",
      },
      session
    );
    console.log(`  -> Default 'Walking Customer' created.`);

    const adminRole = createdRoles.find((r) => r.name === "Super Admin");
    if (!adminRole)
      throw new Error("Super Admin role was not created during seeding.");
    return { adminRole };
  }

  /**
   * Seeds the primary owner's user account.
   * @private
   */
  async _seedOwnerAccount(models, session, { owner }, adminRole) {
    const { User, Branch } = models;
    // In a real transactional implementation, the branch should be created here too.
    // For now, we assume it's passed in.
    await User.create(
      [
        {
          name: owner.name,
          email: owner.email,
          password: owner.password,
          role: adminRole._id,
          assignedBranchId: owner.assignedBranchId, // This needs to be the ID of the just-created branch
        },
      ],
      { session }
    );
    console.log(`  -> Owner account created.`);
  }

  /**
   * Seeds all master data related to inventory (Brands, Categories, Products, etc.).
   * @private
   */
  async _seedMasterData(models, session) {
    const {
      Brand,
      Category,
      Attribute,
      AttributeSet,
      ProductTemplates,
      Account,
    } = models;

    // Seed simple lists
    await Brand.insertMany(
      BRAND_MASTER_LIST.map((b) => (b.name ? { name: b.name } : b)),
      { session }
    );

    // Seed hierarchical categories
    for (const cat of CATEGORY_MASTER_LIST) {
      const [parentDoc] = await Category.create([{ name: cat.name }], {
        session,
      });
      if (cat.children && cat.children.length > 0) {
        await Category.insertMany(
          cat.children.map((child) => ({
            name: child.name,
            parentId: parentDoc._id,
          })),
          { session }
        );
      }
    }

    // Seed Attributes and Sets
    const createdAttributes = await Attribute.insertMany(
      ATTRIBUTE_MASTER_LIST,
      { session }
    );
    const attributeMap = new Map(
      createdAttributes.map((attr) => [attr.key, attr._id])
    );
    const attributeSetDocs = ATTRIBUTE_SET_MASTER_LIST.map((set) => ({
      name: set.name,
      key: set.key || set.name.toLowerCase().replace(/\s+/g, "_"),
      attributes: set.attributeKeys
        .map((key) => attributeMap.get(key))
        .filter(Boolean),
    }));
    await AttributeSet.insertMany(attributeSetDocs, { session });

    // Seed Product Templates
    const [brands, categories, attributeSets, accounts] = await Promise.all([
      Brand.find({}).session(session),
      Category.find({}).session(session),
      AttributeSet.find({}).session(session),
      Account.find({}).session(session),
    ]);
    const brandMap = new Map(brands.map((b) => [b.name, b._id]));
    const categoryMap = new Map(categories.map((c) => [c.name, c._id]));
    const attributeSetMap = new Map(attributeSets.map((a) => [a.name, a._id]));
    const accountMap = new Map(accounts.map((a) => [a.name, a._id]));

    const templateDocs = PRODUCT_TEMPLATE_MASTER_LIST.map((template) => ({
      ...template,
      brandId: brandMap.get(template.brandName),
      categoryId: categoryMap.get(template.categoryName),
      attributeSetId: attributeSetMap.get(template.attributeSetName),
      costPrice: 0,
      sellingPrice: 0,
      assetAccountId: accountMap.get(template.assetAccountName),
      revenueAccountId: accountMap.get(template.revenueAccountName),
      cogsAccountId: accountMap.get(template.cogsAccountName),
    })).filter((t) => t.brandId && t.categoryId && t.assetAccountId);

    if (templateDocs.length > 0) {
      await ProductTemplates.insertMany(templateDocs, { session });
    }
    console.log(`  -> Master Inventory data seeded.`);
  }
}

module.exports = new TenantProvisioningService();
