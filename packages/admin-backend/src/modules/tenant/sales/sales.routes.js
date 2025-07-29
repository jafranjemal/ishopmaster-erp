const express = require("express")
const {
  createSale,
  createDraft,
  createQuotation,
  getHeldSales,
  updateSaleStatus,
  calculateTotals,
  deleteDraftOrHold,
  getAllInvoices,
  getSaleById,
  reopenInvoiceForExchange,
} = require("./sales.controller")
const { protect, authorize } = require("../../../middleware/auth.middleware")

const router = express.Router()
router.use(protect, authorize("sales:pos:access"))

// The main endpoint for finalizing a sale
router.route("/").post(createSale)
router.get("/invoices", authorize("sales:invoice:view_all"), getAllInvoices)
router.post("/invoices/:id/reopen-for-exchange", authorize("sales:exchange:process"), reopenInvoiceForExchange)

// Endpoints for advanced workflows
router.route("/drafts").post(createDraft)
router.route("/quotations").post(createQuotation)
router.route("/held").get(getHeldSales)
router.route("/:id/status").patch(updateSaleStatus)
router.route("/:id").get(authorize("sales:invoice:view_all"), getSaleById).delete(deleteDraftOrHold)
router.post("/calculate-totals", calculateTotals)
// We will add routes for getting and converting quotations later

module.exports = router
