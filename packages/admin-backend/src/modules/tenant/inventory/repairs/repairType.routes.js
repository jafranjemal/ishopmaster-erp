const express = require("express");
const {
  getAllRepairTypes,
  createRepairType,
  updateRepairType,
  deleteRepairType,
} = require("./repairType.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");

const router = express.Router();

router.use(protect, authorize("inventory:product:manage"));

router.route("/").get(getAllRepairTypes).post(createRepairType);

router.route("/:id").put(updateRepairType).delete(deleteRepairType);

module.exports = router;
