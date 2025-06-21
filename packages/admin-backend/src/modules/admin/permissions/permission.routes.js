const express = require("express");
const {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} = require("./permission.controller");

const router = express.Router();

// Route to get all permissions and create a new one
router.route("/").get(getAllPermissions).post(createPermission);

// Route for operations on a single permission by its ID
router
  .route("/:id")
  .get(getPermissionById)
  .put(updatePermission)
  .delete(deletePermission);

module.exports = router;
