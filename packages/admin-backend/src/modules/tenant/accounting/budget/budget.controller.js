const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");

// @desc    Get all budgets for a given year, with optional filtering
exports.getBudgets = asyncHandler(async (req, res, next) => {
  const { Account, Budget, FinancialPeriod } = req.models;
  const { year, branchId, departmentId, periodStatus = "all", view = "flat" } = req.query;

  if (!year) {
    return res.status(400).json({ success: false, error: "A year must be provided." });
  }

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  // const periodQuery = { startDate: { $gte: startDate, $lte: endDate } };
  const periodQuery = {
    name: new RegExp(`\\b${year}\\b`), // e.g. matches "January 2025", "Dec 2025"
  };
  if (periodStatus === "open") periodQuery.status = "Open";
  else if (periodStatus === "closed") periodQuery.status = "Closed";

  console.log("Period query:", periodQuery);
  const periods = await FinancialPeriod.find(periodQuery).sort("startDate").lean();
  const periodIds = periods.map((p) => p._id);

  const filters = { financialPeriodId: { $in: periodIds } };

  if (branchId && branchId !== "all") {
    filters.branchId = new mongoose.Types.ObjectId(branchId);
  } else if (view === "flat") {
    filters.branchId = null;
  }

  if (departmentId && departmentId !== "all") {
    filters.departmentId = new mongoose.Types.ObjectId(departmentId);
  } else if (view === "flat") {
    filters.departmentId = null;
  }

  if (view === "flat") {
    // -----------------------
    // 🔁 OLD LOGIC (flat)
    // -----------------------
    const budgets = await Budget.find(filters)
      .populate("accountId", "name")
      .populate("financialPeriodId", "name");

    console.log("Budgets fetched:", budgets.length, "for year", year, "with filters:", filters);
    return res.status(200).json({ success: true, data: budgets });
  }

  // -----------------------
  // 📊 NEW LOGIC (summary)
  // -----------------------

  const budgets = await Budget.find(filters).lean();

  // Map budgets: budgetMap[periodId][accountId] = amount
  const budgetMap = {};
  for (const b of budgets) {
    const pid = b.financialPeriodId.toString();
    const aid = b.accountId.toString();
    budgetMap[pid] = budgetMap[pid] || {};
    budgetMap[pid][aid] = b.amount;
  }

  const accounts = await Account.find({}).select("_id name").lean();

  const data = periods.map((p) => {
    const pid = p._id.toString();
    const accountBudgets = {};
    for (const acc of accounts) {
      const aid = acc._id.toString();
      accountBudgets[aid] = budgetMap[pid]?.[aid] ?? 0;
    }
    return {
      period: {
        _id: p._id,
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
      },
      accountBudgets,
    };
  });

  res.json({ success: true, data });
});

// @desc    Create or Update a single budget entry (Upsert)
// @route   POST /api/v1/tenant/accounting/budgets
exports.createOrUpdateBudget = asyncHandler(async (req, res, next) => {
  const { Budget } = req.models;
  const { financialPeriodId, accountId, amount, branchId, departmentId } = req.body;

  console.log("Creating or updating budget with data:", {
    financialPeriodId,
    accountId,
    amount,
    branchId,
    departmentId,
  });
  const filter = {
    financialPeriodId: new mongoose.Types.ObjectId(financialPeriodId),
    accountId: new mongoose.Types.ObjectId(accountId),
    branchId: branchId ? new mongoose.Types.ObjectId(branchId) : null,
    departmentId: departmentId ? new mongoose.Types.ObjectId(departmentId) : null,
  };

  const update = {
    amount,
    createdBy: req.user._id,
  };

  const budgetEntry = await Budget.findOneAndUpdate(filter, update, {
    new: true, // Return the new document if one is created
    upsert: true, // Create a new document if one doesn't exist
    runValidators: true,
  });

  res.status(201).json({ success: true, data: budgetEntry });
});

// @desc    Delete a budget entry
// @route   DELETE /api/v1/tenant/accounting/budgets/:id
exports.deleteBudget = asyncHandler(async (req, res, next) => {
  const { Budget } = req.models;
  const budget = await Budget.findByIdAndDelete(req.params.id);
  if (!budget) return res.status(404).json({ success: false, error: "Budget entry not found." });
  res.status(200).json({ success: true, data: {} });
});
