const asyncHandler = require("../../../../middleware/asyncHandler");

exports.getAllJobPositions = asyncHandler(async (req, res, next) => {
  const { JobPosition } = req.models;
  const positions = await JobPosition.find({}).populate("departmentId", "name").sort({ title: 1 });
  res.status(200).json({ success: true, data: positions });
});

exports.createJobPosition = asyncHandler(async (req, res, next) => {
  const { JobPosition } = req.models;
  const newPosition = await JobPosition.create(req.body);
  res.status(201).json({ success: true, data: newPosition });
});
