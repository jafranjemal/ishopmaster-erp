const express = require("express");
const ctrl = require("./repairQuote.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

// --- Internal routes for staff, protected by login and permissions ---
router.use(protect);

// This route is for fetching quotes for a specific ticket
router.get("/", authorize("service:quote:view"), ctrl.getQuotesForTicket);

// This route is for generating a new quote from a ticket
router.post("/from-ticket/:ticketId", authorize("service:quote:create"), ctrl.generateQuote);

// This route is for sending the quote to the customer
router.post("/:id/send", authorize("service:quote:create"), ctrl.sendQuote);

// This will be moved to the public router in a later chapter
router.post("/:id/approve", protect, ctrl.approveQuote);

module.exports = router;
