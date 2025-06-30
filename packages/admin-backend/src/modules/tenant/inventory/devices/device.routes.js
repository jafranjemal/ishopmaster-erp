const express = require("express");
const {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
} = require("./device.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require a user with product management permissions
router.use(protect, authorize("inventory:product:manage"));

router.route("/").get(getAllDevices).post(createDevice);

router.route("/:id").get(getDeviceById).put(updateDevice).delete(deleteDevice);

module.exports = router;
