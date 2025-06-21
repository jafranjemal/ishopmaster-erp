const express = require("express");
const {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("./location.controller");

const router = express.Router();

// --- Warehouse Routes ---
router.route("/warehouses").get(getAllWarehouses).post(createWarehouse);

router.route("/warehouses/:id").put(updateWarehouse).delete(deleteWarehouse);

// --- Branch Routes ---
router.route("/branches").get(getAllBranches).post(createBranch);

router.route("/branches/:id").put(updateBranch).delete(deleteBranch);

module.exports = router;
