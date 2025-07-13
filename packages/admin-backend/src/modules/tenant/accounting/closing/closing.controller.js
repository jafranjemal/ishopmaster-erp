const asyncHandler = require("../../../../middleware/asyncHandler");
const closingService = require("../../../../services/closing.service");

exports.getClosingStatus = asyncHandler(async (req, res, next) => {
  const results = await closingService.runValidations(req.models, {
    periodId: req.params.periodId,
  });
  res.status(200).json({ success: true, data: results });
});

exports.closePeriod = asyncHandler(async (req, res, next) => {
  const closedPeriod = await closingService.closePeriod(req.models, {
    periodId: req.params.periodId,
    userId: req.user._id,
  });
  res
    .status(200)
    .json({
      success: true,
      data: closedPeriod,
      message: "Financial period has been successfully closed.",
    });
});
