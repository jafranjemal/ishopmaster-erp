const express = require("express");
const {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} = require("./role.controller");
// We would import authorize middleware here later e.g. authorize('hr:role:manage')

const router = express.Router();

router.route("/").get(getAllRoles).post(createRole);
router.route("/:id").put(updateRole).delete(deleteRole);

module.exports = router;
