const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Get all customer groups, including the count of customers in each
// @route   GET /api/v1/tenant/crm/groups
exports.getAllCustomerGroups = asyncHandler(async (req, res, next) => {
  const { CustomerGroup } = req.models;
  const groups = await CustomerGroup.aggregate([
    {
      $lookup: {
        from: "customers", // The collection name for the Customer model
        localField: "_id",
        foreignField: "customerGroupId",
        as: "customers",
      },
    },
    {
      $addFields: {
        customerCount: { $size: "$customers" },
      },
    },
    {
      $project: {
        customers: 0, // Exclude the full customer array from the final response
      },
    },
    { $sort: { name: 1 } },
  ]);
  res.status(200).json({ success: true, data: groups });
});

// @desc    Create a new customer group
// @route   POST /api/v1/tenant/crm/groups
exports.createCustomerGroup = asyncHandler(async (req, res, next) => {
  const { CustomerGroup } = req.models;
  const newGroup = await CustomerGroup.create(req.body);
  res.status(201).json({ success: true, data: newGroup });
});

// @desc    Update a customer group
// @route   PUT /api/v1/tenant/crm/groups/:id
exports.updateCustomerGroup = asyncHandler(async (req, res, next) => {
  const { CustomerGroup } = req.models;
  const updatedGroup = await CustomerGroup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedGroup)
    return res.status(404).json({ success: false, error: "Customer group not found." });
  res.status(200).json({ success: true, data: updatedGroup });
});

// @desc    Delete a customer group
// @route   DELETE /api/v1/tenant/crm/groups/:id
exports.deleteCustomerGroup = asyncHandler(async (req, res, next) => {
  const { CustomerGroup, Customer } = req.models;
  const groupId = req.params.id;

  // Integrity Check: Prevent deleting if customers are assigned to this group.
  const customerCount = await Customer.countDocuments({ customerGroupId: groupId });
  if (customerCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete. This group is assigned to ${customerCount} customer(s).`,
      });
  }

  const group = await CustomerGroup.findByIdAndDelete(groupId);
  if (!group) return res.status(404).json({ success: false, error: "Customer group not found." });

  res.status(200).json({ success: true, data: {} });
});
