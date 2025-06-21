const asyncHandler = require("../../../middleware/asyncHandler");

exports.getAllRoles = asyncHandler(async (req, res, next) => {
  const { Role } = req.models;
  const roles = await Role.find({}).sort({ isSystemRole: -1, name: 1 });
  res.status(200).json({ success: true, data: roles });
});

exports.createRole = asyncHandler(async (req, res, next) => {
  const { Role } = req.models;
  const { name, description, permissions } = req.body;
  const newRole = await Role.create({
    name,
    description,
    permissions,
    isSystemRole: false,
    isDeletable: true,
  });
  res.status(201).json({ success: true, data: newRole });
});

exports.updateRole = asyncHandler(async (req, res, next) => {
  const { Role } = req.models;
  const { name, description, permissions } = req.body;
  const role = await Role.findByIdAndUpdate(
    req.params.id,
    { name, description, permissions },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!role)
    return res.status(404).json({ success: false, error: "Role not found" });
  res.status(200).json({ success: true, data: role });
});

exports.deleteRole = asyncHandler(async (req, res, next) => {
  const { Role, User } = req.models;
  const role = await Role.findById(req.params.id);

  if (!role)
    return res.status(404).json({ success: false, error: "Role not found" });
  if (!role.isDeletable)
    return res
      .status(400)
      .json({ success: false, error: "Cannot delete a system role." });

  const usersWithRole = await User.countDocuments({ role: req.params.id });
  if (usersWithRole > 0)
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete role. It is currently assigned to ${usersWithRole} user(s).`,
      });

  await role.deleteOne();
  res.status(200).json({ success: true, data: {} });
});
