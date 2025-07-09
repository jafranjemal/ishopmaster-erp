const asyncHandler = require("../../../middleware/asyncHandler");
const leadService = require("../../../services/lead.service");
const mongoose = require("mongoose");

// @desc    Get all leads with pagination and filtering
// @route   GET /api/v1/tenant/crm/leads
exports.getAllLeads = asyncHandler(async (req, res, next) => {
  const { Lead } = req.models;
  const { page = 1, limit = 25, status, assignedTo } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (status) filters.status = status;
  if (assignedTo) filters.assignedTo = new mongoose.Types.ObjectId(assignedTo);

  const [leads, total] = await Promise.all([
    Lead.find(filters)
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Lead.countDocuments(filters),
  ]);

  res
    .status(200)
    .json({
      success: true,
      total,
      pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit) },
      data: leads,
    });
});

// @desc    Create a new lead
// @route   POST /api/v1/tenant/crm/leads
exports.createLead = asyncHandler(async (req, res, next) => {
  const { Lead } = req.models;
  const lead = await Lead.create({ ...req.body, assignedTo: req.user._id });
  res.status(201).json({ success: true, data: lead });
});

// @desc    Get a single lead by ID
// @route   GET /api/v1/tenant/crm/leads/:id
exports.getLeadById = asyncHandler(async (req, res, next) => {
  const { Lead } = req.models;
  const lead = await Lead.findById(req.params.id).populate("assignedTo", "name");
  if (!lead) return res.status(404).json({ success: false, error: "Lead not found." });
  res.status(200).json({ success: true, data: lead });
});

// @desc    Update a lead
// @route   PUT /api/v1/tenant/crm/leads/:id
exports.updateLead = asyncHandler(async (req, res, next) => {
  const { Lead } = req.models;
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!lead) return res.status(404).json({ success: false, error: "Lead not found." });
  res.status(200).json({ success: true, data: lead });
});

// @desc    Convert a lead to a customer and opportunity
// @route   POST /api/v1/tenant/crm/leads/:id/convert
exports.convertLead = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await leadService.convertLead(
        req.models,
        {
          leadId: req.params.id,
          userId: req.user._id,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});
