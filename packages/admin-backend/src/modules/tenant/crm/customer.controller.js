const asyncHandler = require("../../../middleware/asyncHandler");
const customerService = require("../../../services/customer.service");

// @desc    Create a new customer and their linked ledger account
// @route   POST /api/v1/tenant/crm
// @access  Private (Requires 'crm:customer:manage' permission)
exports.createCustomer = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let customer;
  try {
    await session.withTransaction(async () => {
      // Delegate the complex, multi-step logic to the service layer
      customer = await customerService.createCustomerWithLedger(
        req.models,
        req.body,
        session
      );
    });
    res.status(201).json({ success: true, data: customer });
  } finally {
    session.endSession();
  }
});

// @desc    Get all customers for the tenant
// @route   GET /api/v1/tenant/crm
// @access  Private (Requires 'crm:customer:manage' permission)
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  const { Customer } = req.models;
  // Populate the ledgerAccountId to show the linked financial account details if needed
  const customers = await Customer.find({}).populate(
    "ledgerAccountId",
    "name type"
  );
  res.status(200).json({ success: true, data: customers });
});

// @desc    Get a single customer by ID
// @route   GET /api/v1/tenant/crm/customers/:id
// @access  Private (Requires 'crm:customer:manage' permission)
exports.getCustomerById = asyncHandler(async (req, res, next) => {
  const { Customer } = req.models;
  const customer = await Customer.findById(req.params.id).populate(
    "ledgerAccountId",
    "name type"
  );

  if (!customer) {
    return res
      .status(404)
      .json({
        success: false,
        error: `Customer not found with id of ${req.params.id}`,
      });
  }

  res.status(200).json({ success: true, data: customer });
});

// @desc    Update a customer's details
// @route   PUT /api/v1/tenant/crm/:id
// @access  Private (Requires 'crm:customer:manage' permission)
exports.updateCustomer = asyncHandler(async (req, res, next) => {
  const { Customer } = req.models;
  // Whitelist of fields that a user is allowed to update.
  // Notice `ledgerAccountId` is NOT included for security.
  const { name, phone, email, address, creditLimit, isActive } = req.body;
  const fieldsToUpdate = { name, phone, email, address, creditLimit, isActive };

  const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCustomer)
    return res
      .status(404)
      .json({ success: false, error: "Customer not found" });
  res.status(200).json({ success: true, data: updatedCustomer });
});

// @desc    Delete a customer
// @route   DELETE /api/v1/tenant/crm/:id
// @access  Private (Requires 'crm:customer:manage' permission)
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
  const { Customer, LedgerEntry } = req.models;

  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res
      .status(404)
      .json({ success: false, error: "Customer not found" });

  // Data Integrity Check: Prevent deletion if the customer has financial history.
  if (customer.ledgerAccountId) {
    const entryCount = await LedgerEntry.countDocuments({
      $or: [
        { debitAccountId: customer.ledgerAccountId },
        { creditAccountId: customer.ledgerAccountId },
      ],
    });

    if (entryCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete. Customer has ${entryCount} financial transaction(s).`,
      });
    }
  }

  await customer.deleteOne();
  // We should also delete the associated ledger account if it has no transactions.
  // This logic could be added to a service layer for cleaner code.
  // await models.Account.findByIdAndDelete(customer.ledgerAccountId);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get all ledger entries for a single customer, with pagination
// @route   GET /api/v1/tenant/crm/customers/:id/ledger
// @access  Private (Requires 'crm:customer:view_financials' permission)
exports.getCustomerLedger = asyncHandler(async (req, res, next) => {
  const { Customer, LedgerEntry } = req.models;
  const customerId = req.params.id;

  // 1. Find the customer to get their ledgerAccountId
  const customer = await Customer.findById(customerId)
    .select("ledgerAccountId")
    .lean();
  if (!customer || !customer.ledgerAccountId) {
    return res
      .status(404)
      .json({
        success: false,
        error: "Customer or their financial account not found.",
      });
  }

  const ledgerAccountId = customer.ledgerAccountId;

  // 2. Setup pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  // 3. Create the query to find all transactions for this account
  const query = {
    $or: [
      { debitAccountId: ledgerAccountId },
      { creditAccountId: ledgerAccountId },
    ],
  };

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
  ]);

  const totalPages = Math.ceil(total / limit);

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
  });
});
