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
    return res
      .status(400)
      .json({
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
