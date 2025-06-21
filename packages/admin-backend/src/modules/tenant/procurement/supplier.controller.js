const asyncHandler = require("../../../middleware/asyncHandler");
const supplierService = require("../../../services/supplier.service");

// @desc    Create a new supplier and their linked ledger account
// @route   POST /api/v1/tenant/procurement/suppliers
// @access  Private (Requires 'procurement:supplier:manage' permission)
exports.createSupplier = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let supplier;
  try {
    await session.withTransaction(async () => {
      supplier = await supplierService.createSupplierWithLedger(
        req.models,
        req.body,
        session
      );
    });
    res.status(201).json({ success: true, data: supplier });
  } finally {
    session.endSession();
  }
});

// @desc    Get all suppliers for the tenant
// @route   GET /api/v1/tenant/procurement/suppliers
// @access  Private (Requires 'procurement:supplier:manage' permission)
exports.getAllSuppliers = asyncHandler(async (req, res, next) => {
  const { Supplier } = req.models;
  const suppliers = await Supplier.find({}).populate(
    "ledgerAccountId",
    "name type"
  );
  res.status(200).json({ success: true, data: suppliers });
});

// @desc    Get a single supplier by ID
// @route   GET /api/v1/tenant/procurement/suppliers/:id
// @access  Private (Requires 'procurement:supplier:manage' permission)
exports.getSupplierById = asyncHandler(async (req, res, next) => {
  const { Supplier } = req.models;
  const supplier = await Supplier.findById(req.params.id).populate(
    "ledgerAccountId",
    "name type"
  );
  if (!supplier)
    return res
      .status(404)
      .json({ success: false, error: "Supplier not found" });
  res.status(200).json({ success: true, data: supplier });
});

// @desc    Update a supplier's details
// @route   PUT /api/v1/tenant/procurement/suppliers/:id
// @access  Private (Requires 'procurement:supplier:manage' permission)
exports.updateSupplier = asyncHandler(async (req, res, next) => {
  const { Supplier } = req.models;
  // Whitelist of fields that a user is allowed to update.
  const { name, contactPerson, phone, email, address, isActive } = req.body;
  const fieldsToUpdate = {
    name,
    contactPerson,
    phone,
    email,
    address,
    isActive,
  };

  const updatedSupplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedSupplier)
    return res
      .status(404)
      .json({ success: false, error: "Supplier not found" });
  res.status(200).json({ success: true, data: updatedSupplier });
});

// @desc    Delete a supplier
// @route   DELETE /api/v1/tenant/procurement/suppliers/:id
// @access  Private (Requires 'procurement:supplier:manage' permission)
exports.deleteSupplier = asyncHandler(async (req, res, next) => {
  const { Supplier, LedgerEntry, Account } = req.models;

  const supplier = await Supplier.findById(req.params.id);
  if (!supplier)
    return res
      .status(404)
      .json({ success: false, error: "Supplier not found" });

  // Data Integrity Check: Prevent deletion if the supplier has financial history.
  if (supplier.ledgerAccountId) {
    const entryCount = await LedgerEntry.countDocuments({
      $or: [
        { debitAccountId: supplier.ledgerAccountId },
        { creditAccountId: supplier.ledgerAccountId },
      ],
    });

    if (entryCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete. Supplier has ${entryCount} financial transaction(s).`,
      });
    }
  }

  const session = await req.dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      // Delete the supplier record
      await supplier.deleteOne({ session });
      // Also delete their associated ledger account if it exists and has no transactions
      if (supplier.ledgerAccountId) {
        await Account.findByIdAndDelete(supplier.ledgerAccountId, { session });
      }
    });
    res.status(200).json({ success: true, data: {} });
  } finally {
    session.endSession();
  }
});

// @desc    Get all ledger entries for a single supplier, with pagination
// @route   GET /api/v1/tenant/procurement/suppliers/:id/ledger
// @access  Private (Requires 'procurement:supplier:manage' permission)
exports.getSupplierLedger = asyncHandler(async (req, res, next) => {
  const { Supplier, LedgerEntry } = req.models;
  const supplierId = req.params.id;

  const supplier = await Supplier.findById(supplierId)
    .select("ledgerAccountId")
    .lean();
  if (!supplier || !supplier.ledgerAccountId) {
    return res
      .status(404)
      .json({
        success: false,
        error: "Supplier or their financial account not found.",
      });
  }

  const ledgerAccountId = supplier.ledgerAccountId;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { debitAccountId: ledgerAccountId },
      { creditAccountId: ledgerAccountId },
    ],
  };

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

  res.status(200).json({
    success: true,
    count: entries.length,
    total,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
    data: entries,
  });
});
