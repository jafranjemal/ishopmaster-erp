const asyncHandler = require("../../../middleware/asyncHandler");
const opportunityService = require("../../../services/opportunity.service");

exports.getAllOpportunities = asyncHandler(async (req, res, next) => {
  const { Opportunity } = req.models;
  const opportunities = await Opportunity.find(req.query.filters || {})
    .populate("accountId", "name")
    .populate("assignedTo", "name");
  res.status(200).json({ success: true, data: opportunities });
});

exports.getOpportunityById = asyncHandler(async (req, res, next) => {
  const { Opportunity } = req.models;
  const opportunity = await Opportunity.findById(req.params.id)
    .populate("accountId", "name phone")
    .populate("assignedTo", "name")
    .populate("items.ProductVariantId", "variantName sku");
  if (!opportunity)
    return res.status(404).json({ success: false, error: "Opportunity not found." });
  res.status(200).json({ success: true, data: opportunity });
});

exports.createOpportunity = asyncHandler(async (req, res, next) => {
  const opportunity = await opportunityService.createOpportunity(
    req.models,
    req.body,
    req.user._id
  );
  res.status(201).json({ success: true, data: opportunity });
});

exports.updateOpportunity = asyncHandler(async (req, res, next) => {
  const { Opportunity } = req.models;
  // This handles updates to the main opportunity details and its items array
  const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!opportunity)
    return res.status(404).json({ success: false, error: "Opportunity not found." });
  res.status(200).json({ success: true, data: opportunity });
});

exports.updateOpportunityStage = asyncHandler(async (req, res, next) => {
  const { newStage, lossReason } = req.body;
  if (!newStage) {
    return res.status(400).json({ success: false, error: "newStage is required." });
  }
  const updatedOpportunity = await opportunityService.updateStage(req.models, {
    opportunityId: req.params.id,
    newStage,
    lossReason,
  });
  res.status(200).json({ success: true, data: updatedOpportunity });
});
