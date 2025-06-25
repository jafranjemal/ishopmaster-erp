const { default: mongoose } = require("mongoose");
const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Get all accounts from the Chart of Accounts for the current tenant
// @route   GET /api/v1/tenant/accounting/accounts
// @access  Private (Requires permission like 'accounting:chart:view')
exports.getAllAccounts = asyncHandler(async (req, res, next) => {
  const { Account } = req.models;
  const accounts = await Account.find({}).sort({ type: 1, name: 1 });
  res.status(200).json({ success: true, data: accounts });
});

// @desc    Create a new account in the Chart of Accounts
// @route   POST /api/v1/tenant/accounting/accounts
// @access  Private (Requires permission like 'accounting:chart:manage')
exports.createAccount = asyncHandler(async (req, res, next) => {
  const { Account } = req.models;
  const { name, type, subType, description } = req.body;

  // Ensure users cannot create system-level accounts
  const newAccount = await Account.create({
    name,
    type,
    subType,
    description,
    isSystemAccount: false, // User-created accounts are never system accounts
  });

  res.status(201).json({ success: true, data: newAccount });
});

exports.getAccountById = asyncHandler(async (req, res, next) => {
  const { Account } = req.models;
  let account = await Account.findById(req.params.id);
  res.status(200).json({ success: true, data: account });
});

// @desc    Update a user-created account
// @route   PUT /api/v1/tenant/accounting/accounts/:id
// @access  Private (Requires permission like 'accounting:chart:manage')
exports.updateAccount = asyncHandler(async (req, res, next) => {
  const { Account } = req.models;

  let account = await Account.findById(req.params.id);
  if (!account)
    return res.status(404).json({ success: false, error: "Account not found" });

  // SECURITY: Prevent editing of core system accounts
  if (account.isSystemAccount) {
    return res
      .status(400)
      .json({ success: false, error: "Cannot modify a system account." });
  }

  // Whitelist fields that can be updated
  const { name, subType, description, isActive } = req.body;
  const fieldsToUpdate = { name, subType, description, isActive };

  const updatedAccount = await Account.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: updatedAccount });
});

// @desc    Delete a user-created account
// @route   DELETE /api/v1/tenant/accounting/accounts/:id
// @access  Private (Requires permission like 'accounting:chart:manage')
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const { Account, LedgerEntry } = req.models;
  const accountId = req.params.id;

  let account = await Account.findById(accountId);
  if (!account)
    return res.status(404).json({ success: false, error: "Account not found" });

  // INTEGRITY CHECK 1: Prevent deletion of core system accounts
  if (account.isSystemAccount) {
    return res
      .status(400)
      .json({ success: false, error: "Cannot delete a system account." });
  }

  // INTEGRITY CHECK 2: Prevent deletion if the account has any transactions
  const entryCount = await LedgerEntry.countDocuments({
    $or: [{ debitAccountId: accountId }, { creditAccountId: accountId }],
  });

  if (entryCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete account. It is used in ${entryCount} ledger entries.`,
    });
  }

  await account.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get all ledger entries with pagination and filtering
// @route   GET /api/v1/tenant/accounting/ledger
// @access  Private (Requires permission like 'accounting:ledger:view')
exports.getAllLedgerEntries = asyncHandler(async (req, res, next) => {
  const { LedgerEntry } = req.models;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  let query = {};
  // Add filtering capabilities
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

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

/**
 * @desc    Get the full chart of accounts for the tenant
 * @route   GET /api/v1/tenant/accounting/chart
 * @access  Private (Requires accounting:chart:view permission)
 */
exports.getChartOfAccounts = asyncHandler(async (req, res, next) => {
  const { Account } = req.models;
  const accounts = await Account.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: accounts });
});

/**
 * @desc    Get all ledger entries for a specific account with pagination and date filtering.
 * @route   GET /api/v1/tenant/accounting/accounts/:accountId/ledger
 * @access  Private (accounting:ledger:view)
 */
exports.getLedgerForAccount = asyncHandler(async (req, res, next) => {
  const { LedgerEntry } = req.models;
  const { accountId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid account ID" });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  // Build base filter: match either debit or credit for the account
  const filter = {
    $or: [
      { debitAccountId: new mongoose.Types.ObjectId(accountId) },
      { creditAccountId: new mongoose.Types.ObjectId(accountId) },
    ],
  };

  // Add date range filtering if provided
  if (req.query.startDate || req.query.endDate) {
    filter.date = {};
    if (req.query.startDate) {
      filter.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.date.$lte = new Date(req.query.endDate);
    }
  }

  console.log("LedgerEntry filter:", JSON.stringify(filter, null, 2));

  // Fetch ledger entries + count in parallel
  const [entries, total] = await Promise.all([
    LedgerEntry.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LedgerEntry.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: entries.length,
    pagination: {
      total,
      limit,
      page,
      pages: Math.ceil(total / limit),
    },
    data: entries,
  });
});
