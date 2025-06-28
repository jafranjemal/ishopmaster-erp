const express = require("express");
const {
  getGRNsAwaitingInvoice,
  getGrnsByIds,
  getAllGRNs,
  getGrnById,
} = require("./goodsReceiptNote.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.route("/").get(getAllGRNs);
// This specific route is for viewing the AP work queue
router.get(
  "/awaiting-invoice",
  authorize("accounting:payables:view"),
  getGRNsAwaitingInvoice
);
router.post("/by-ids", authorize("accounting:payables:view"), getGrnsByIds);
router.route("/:id").get(getGrnById);
module.exports = router;
