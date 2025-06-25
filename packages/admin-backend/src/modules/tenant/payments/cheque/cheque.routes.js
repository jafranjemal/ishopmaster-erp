const express = require("express");
const { getAllPendingCheques, updateStatus } = require("./cheque.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file require a user to be authenticated.
router.use(protect);

// Route to get the list of cheques awaiting action
router.get(
  "/pending",
  authorize("accounting:cheque:view"),
  getAllPendingCheques
);

// Route to update the status of a single cheque
router.patch(
  "/:id/status",
  authorize("accounting:cheque:manage"),
  updateStatus
);

module.exports = router;
