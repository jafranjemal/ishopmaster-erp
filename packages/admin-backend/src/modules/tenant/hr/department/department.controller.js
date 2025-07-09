const asyncHandler = require("../../../../middleware/asyncHandler");

exports.getAllDepartments = asyncHandler(async (req, res, next) => {
  const { Department } = req.models;
  const departments = await Department.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: departments });
});

exports.createDepartment = asyncHandler(async (req, res, next) => {
  const { Department } = req.models;
  const newDepartment = await Department.create(req.body);
  res.status(201).json({ success: true, data: newDepartment });
});

exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const { Department } = req.models;
  const updated = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updated) return res.status(404).json({ success: false, error: "Department not found." });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const { Department, JobPosition } = req.models;
  const departmentId = req.params.id;
  const positionCount = await JobPosition.countDocuments({ departmentId });
  if (positionCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete. This department has ${positionCount} job position(s) assigned to it.`,
      });
  }
  const department = await Department.findByIdAndDelete(departmentId);
  if (!department) return res.status(404).json({ success: false, error: "Department not found." });
  res.status(200).json({ success: true, data: {} });
});
