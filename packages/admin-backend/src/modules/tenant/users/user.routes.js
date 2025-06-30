const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  adminResetUserPassword,
} = require("./user.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// All routes below are protected and require a valid user session.
router.use(protect);

router
  .route("/")
  // A user can see the list if they can either see ALL users or just their branch's users.
  .get(authorize("setting:user:view_all", "setting:user:view_branch"), getAllUsers)
  // A user can only create a new user if they have the manage permission.
  .post(authorize("setting:user:manage"), createUser);

router.patch(
  "/:id/reset-password",
  authorize("hr:employee:manage_credentials"),
  adminResetUserPassword
);

router
  .route("/:id")
  .get(authorize("setting:user:view_all", "setting:user:view_branch"), getUserById)
  .put(authorize("setting:user:manage"), updateUser)
  // Deactivating is also a management action.
  .delete(authorize("setting:user:manage"), deactivateUser);

module.exports = router;
