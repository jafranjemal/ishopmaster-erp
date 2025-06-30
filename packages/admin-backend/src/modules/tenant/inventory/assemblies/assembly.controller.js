const asyncHandler = require("../../../../middleware/asyncHandler");
const assemblyService = require("../../../../services/assembly.service");

// @desc    Create a new assembly (kitting) job
// @route   POST /api/v1/tenant/inventory/assemblies
// @access  Private (Requires 'inventory:assembly:create' permission)
exports.createAssembly = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await assemblyService.assembleKit(
        req.models,
        {
          ...req.body, // Contains bundleVariantId, quantityToAssemble, componentSelections
          userId: req.user._id,
        },
        session
      );
    });
    res.status(201).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});
