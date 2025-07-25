const { default: mongoose } = require("mongoose")
const asyncHandler = require("../../../middleware/asyncHandler")
const customerService = require("../../../services/customer.service")
const tokenService = require("../../../services/token.service")

// @desc    Create a new customer and their linked ledger account
// @route   POST /api/v1/tenant/crm
// @access  Private (Requires 'crm:customer:manage' permission)
exports.createCustomer = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession()
  let customer
  try {
    await session.withTransaction(async () => {
      // Delegate the complex, multi-step logic to the service layer
      customer = await customerService.createCustomerWithLedger(req.models, req.body, session)
    })
    res.status(201).json({ success: true, data: customer })
  } finally {
    session.endSession()
  }
})

// @desc    Get all customers for the tenant
// @route   GET /api/v1/tenant/crm
// @access  Private (Requires 'crm:customer:manage' permission)
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  const { Customer } = req.models
  // Populate the ledgerAccountId to show the linked financial account details if needed
  const customers = await Customer.find({}).populate("ledgerAccountId", "name type")
  res.status(200).json({ success: true, data: customers })
})

// @desc    Get a single customer by ID
// @route   GET /api/v1/tenant/crm/customers/:id
// @access  Private (Requires 'crm:customer:manage' permission)
exports.getCustomerById = asyncHandler(async (req, res, next) => {
  const { Customer, CustomerAuthToken } = req.models
  //const customer = await Customer.findById(req.params.id).populate("ledgerAccountId", "name type");
  const customerId = new mongoose.Types.ObjectId(req.params.id)

  const [customer, activeToken] = await Promise.all([
    Customer.findById(customerId).populate("ledgerAccountId").lean(),
    CustomerAuthToken.findOne({
      customerId: customerId,
      //status: 'active',
      expiryDate: { $gt: new Date() }, // Ensure the token is not expired
    }).lean(),
  ])

  console.log("customer ", customer)
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: `Customer not found with id of ${req.params.id}`,
    })
  }

  const responseData = {
    customer,
    activePortalToken: activeToken ? activeToken.token : null,
  }

  res.status(200).json({ success: true, data: responseData })
})

// @desc    Update a customer's details
// @route   PUT /api/v1/tenant/crm/:id
// @access  Private (Requires 'crm:customer:manage' permission)
exports.updateCustomer = asyncHandler(async (req, res, next) => {
  const { Customer } = req.models
  // Whitelist of fields that a user is allowed to update.
  // Notice `ledgerAccountId` is NOT included for security.
  const { name, phone, email, address, creditLimit, isActive, customerGroupId } = req.body
  const fieldsToUpdate = { name, phone, email, address, creditLimit, isActive, customerGroupId }

  const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  if (!updatedCustomer) return res.status(404).json({ success: false, error: "Customer not found" })
  res.status(200).json({ success: true, data: updatedCustomer })
})

// @desc    Delete a customer
// @route   DELETE /api/v1/tenant/crm/:id
// @access  Private (Requires 'crm:customer:manage' permission)
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
  const { Customer, LedgerEntry } = req.models

  const customer = await Customer.findById(req.params.id)
  if (!customer) return res.status(404).json({ success: false, error: "Customer not found" })

  // Data Integrity Check: Prevent deletion if the customer has financial history.
  if (customer.ledgerAccountId) {
    const entryCount = await LedgerEntry.countDocuments({
      $or: [{ debitAccountId: customer.ledgerAccountId }, { creditAccountId: customer.ledgerAccountId }],
    })

    if (entryCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete. Customer has ${entryCount} financial transaction(s).`,
      })
    }
  }

  await customer.deleteOne()
  // We should also delete the associated ledger account if it has no transactions.
  // This logic could be added to a service layer for cleaner code.
  // await models.Account.findByIdAndDelete(customer.ledgerAccountId);

  res.status(200).json({ success: true, data: {} })
})

// @desc    Get all ledger entries for a single customer, with pagination
// @route   GET /api/v1/tenant/crm/customers/:id/ledger
// @access  Private (Requires 'crm:customer:view_financials' permission)
exports.getCustomerLedger = asyncHandler(async (req, res, next) => {
  const { Customer, LedgerEntry } = req.models
  const customerId = req.params.id

  // 1. Find the customer to get their ledgerAccountId
  const customer = await Customer.findById(customerId).select("ledgerAccountId").lean()
  if (!customer || !customer.ledgerAccountId) {
    return res.status(404).json({
      success: false,
      error: "Customer or their financial account not found.",
    })
  }

  const ledgerAccountId = customer.ledgerAccountId

  // 2. Setup pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 15
  const skip = (page - 1) * limit

  // 3. Create the query to find all transactions for this account
  const query = {
    $or: [{ debitAccountId: ledgerAccountId }, { creditAccountId: ledgerAccountId }],
  }

  // 4. Execute queries in parallel for efficiency
  const [entries, total] = await Promise.all([
    LedgerEntry.find(query)
      .populate("debitAccountId", "name")
      .populate("creditAccountId", "name")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LedgerEntry.countDocuments(query),
  ])

  const totalPages = Math.ceil(total / limit)

  res.status(200).json({
    success: true,
    count: entries.length,
    total,
    pagination: {
      currentPage: page,
      totalPages,
      limit,
    },
    data: entries,
  })
})

// @desc    Manually generate a portal access token for a customer
// @route   POST /api/v1/tenant/crm/customers/:id/generate-portal-token
exports.generatePortalToken = asyncHandler(async (req, res, next) => {
  //const token = await tokenService.generateForCustomer(req.models, { customerId: req.params.id });
  // In a real app, the base URL should come from config/env variables
  const { oneTimeToken } = await tokenService.generateForCustomer(req.models, {
    customerId: req.params.id,
    tenantId: req.tenant.subdomain, // or req.tenant._id, depending on what you use
  })
  const baseUrl = process.env.FRONTEND_PORTAL_BASE_URL
  if (!baseUrl) {
    // This is a critical server configuration error.
    console.error("FATAL ERROR: FRONTEND_PORTAL_BASE_URL is not defined in .env file.")
    return res.status(500).json({ success: false, error: "Server configuration error." })
  }
  const loginUrl = `${baseUrl}/portal/login?token=${oneTimeToken}&tenant=${req.tenant.subdomain}`
  res.status(200).json({ success: true, data: { loginUrl, token: oneTimeToken } })
})

// @desc    Get a customer's credit limit and current A/R balance
// @route   GET /api/v1/tenant/crm/customers/:id/credit-summary
exports.getCreditSummary = asyncHandler(async (req, res, next) => {
  const { Customer, Account } = req.models
  const customer = await Customer.findById(req.params.id).select("creditLimit ledgerAccountId").lean()

  if (!customer) {
    return res.status(404).json({ success: false, error: "Customer not found." })
  }

  console.log("customer ", customer)
  let currentBalance = 0
  if (customer.ledgerAccountId) {
    const arAccount = await Account.findById(customer.ledgerAccountId).select("balance").lean()
    console.log(arAccount)
    // Assuming base currency for now. A more advanced system would specify currency.
    // currentBalance = arAccount.balance.get(req.tenant.settings.localization.baseCurrency) || 0;
    currentBalance = arAccount?.balance?.[req.tenant.settings.localization.baseCurrency] || 0
  }

  res.status(200).json({
    success: true,
    data: {
      creditLimit: customer.creditLimit,
      currentBalance: currentBalance,
    },
  })
})

exports.getCustomerHistory = asyncHandler(async (req, res, next) => {
  const mongoose = require("mongoose")
  const { SalesInvoice, RepairTicket } = req.models
  const customerId = new mongoose.Types.ObjectId(req.params.id)

  // ——————————————
  // 1️⃣ Sales history
  // ——————————————
  const salesHistory = await SalesInvoice.aggregate([
    { $match: { customerId, status: "completed" } },
    { $sort: { createdAt: -1 } },
    { $limit: 50 },
    // join branch & cashier
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "soldBy",
        foreignField: "_id",
        as: "cashier",
      },
    },
    { $unwind: { path: "$cashier", preserveNullAndEmptyArrays: true } },
    // Optional: lookup payments collection if you have one
    // { $lookup: { from: "payments", localField: "_id", foreignField: "invoiceId", as: "payments" } },
    {
      $project: {
        _id: 1,
        invoiceId: 1,
        totalAmount: 1,
        subTotal: 1,
        totalTax: 1,
        amountPaid: 1,
        paymentStatus: 1,
        globalDiscount: 1,
        additionalCharges: 1,
        createdAt: 1,
        dueDate: 1,
        branchName: "$branch.name",
        cashierName: "$cashier.name",
        itemCount: { $size: "$items" },
        // Example: show first 3 items with description & qty
        previewItems: { $slice: ["$items", 3] },
      },
    },
  ])

  // ——————————————
  // 2️⃣ Repair history
  // ——————————————
  const repairHistory = await RepairTicket.aggregate([
    { $match: { customerId } },
    { $sort: { createdAt: -1 } },
    { $limit: 50 },
    // join branch, technician & assets
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "employees",
        localField: "assignedTo",
        foreignField: "_id",
        as: "technician",
      },
    },
    { $unwind: { path: "$technician", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "assets",
        localField: "assets",
        foreignField: "_id",
        as: "assetDetails",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerId",
      },
    },
    // Optionally: unwind jobSheetHistory or jobSheet to get labor & parts
    {
      $project: {
        _id: 1,
        ticketNumber: 1,
        customerId: { $last: "$customerId" },
        status: 1,
        createdAt: 1,
        branchName: "$branch.name",
        technicianName: { $concat: ["$technician.firstName", " ", "$technician.lastName"] },
        customerComplaint: 1,
        // asset serials
        assets: "$assetDetails.serialNumber",
        // summary of labor & parts from the latest jobSheet (if you track it there)
        jobSheet: {
          partsCount: {
            $size: {
              $filter: {
                input: "$jobSheet",
                as: "i",
                cond: { $eq: ["$$i.itemType", "part"] },
              },
            },
          },
          laborHours: { $sum: "$jobSheet.laborHours" },
          laborEntries: {
            $filter: {
              input: "$jobSheet",
              as: "i",
              cond: { $eq: ["$$i.itemType", "labor"] },
            },
          },
        },
        // final invoice link
        finalInvoiceId: 1,
        // QC status if present
        qcStatus: "$qcResult.status",
      },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      salesHistory,
      repairHistory,
    },
  })
})
