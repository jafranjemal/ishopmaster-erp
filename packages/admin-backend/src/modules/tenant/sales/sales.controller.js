const logger = require("../../../config/logger")
const metrics = require("../../../config/metrics")
const asyncHandler = require("../../../middleware/asyncHandler")
const salesService = require("../../../services/sales.service")
const salesCalculationService = require("../../../services/salesCalculation.service")

const { SaleError, ValidationError } = require("../../../errors/saleErrors")

// @desc    Create a new sale (finalize a POS transaction)
// @route   POST /api/v1/tenant/sales/
// @access  Protected

/**
 * @desc    Reopen a completed sales invoice for an exchange, creating a reversing journal entry.
 * @route   POST /api/v1/tenant/sales/invoices/:id/reopen-for-exchange
 * @access  Private (Requires 'sales:exchange:process' permission)
 */
exports.reopenInvoiceForExchange = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession()
  let originalInvoice
  try {
    await session.withTransaction(async () => {
      originalInvoice = await salesService.reopenInvoiceForExchange(
        req.models,
        {
          invoiceId: req.params.id,
          userId: req.user._id,
        },
        session,
        req.tenant
      )
    })
    res.status(200).json({ success: true, data: originalInvoice })
  } finally {
    session.endSession()
  }
})

exports.createSale = asyncHandler(async (req, res, next) => {
  const startTime = Date.now()
  const session = await req.dbConnection.startSession()

  try {
    let newSaleInvoice

    // Transaction with explicit error handling
    await session.withTransaction(async () => {
      try {
        newSaleInvoice = await salesService.finalizeSale(
          req.models,
          {
            cartData: req.body.cartData,
            paymentData: req.body.paymentData,
            customerId: req.body.customerId,
            branchId: req.user.assignedBranchId,
            userId: req.user._id,
            couponId: req.body.couponId || null,
            sessionId: req.sessionID, // For audit tracking
          },
          req.tenant.settings.localization.baseCurrency,
          req.tenant,
          session
        )

        metrics.increment("sale.success")
      } catch (error) {
        metrics.increment("sale.failure")
        logger.error("Sale transaction failed", {
          error: error.message,
          stack: error.stack,
          userId: req.user._id,
          body: req.body,
        })

        // Re-throw to trigger rollback
        throw error
      }
    })

    // Success response with audit info
    res.status(201).json({
      success: true,
      data: newSaleInvoice,
      metadata: {
        processedAt: new Date(),
        transactionTime: Date.now() - startTime,
        branch: req.user.assignedBranchId,
      },
    })
  } catch (error) {
    // Handle specific error types
    if (error?.code === "VALIDATION_FAILED") {
      return res.status(400).json({
        success: false,
        error: {
          correlationId: req.id, // Add correlation ID here
          code: error.code,
          message: error.message,
          details: error.details,
          validationErrors: error.metadata?.errors,
        },
      })
    }

    // Generic error handler
    logger.error("Sale processing failed", {
      error: error.stack,
      userId: req.user._id,
      body: JSON.stringify(req.body),
    })

    res.status(500).json({
      success: false,
      error: {
        code: "SALE_PROCESSING_FAILED",
        message: "Failed to finalize sale",
        referenceId: req.id, // Correlation ID
      },
    })
  } finally {
    // Ensure session is always ended
    try {
      await session.endSession()
    } catch (sessionError) {
      logger.error("Failed to end MongoDB session", {
        error: sessionError.message,
        originalError: error?.message,
      })
    }
  }
})

// @desc    Save a sale as a draft
// @route   POST /api/v1/tenant/sales/drafts
exports.createDraft = asyncHandler(async (req, res, next) => {
  try {
    console.log("req.body", req.body)
    // Add validation before passing to service
    if (!req.body.cartData || !req.body.customerId) {
      return res.status(400).json({
        success: false,
        error: "cartData and customerId are required",
      })
    }

    const draft = await salesService.createQuoteOrDraft(req.models, {
      cartData: req.body.cartData,
      customerId: req.body.customerId,
      status: "draft",
      userId: req.user._id,
      branchId: req.user.assignedBranchId,
    })

    res.status(201).json({ success: true, data: draft })
  } catch (error) {
    console.log(error)
    if (error?.code === "VALIDATION_FAILED") {
      return res.status(400).json({
        success: false,
        error: {
          correlationId: req.id, // Add correlation ID here
          code: error.code,
          message: error.message,
          details: error.details,
          validationErrors: error.metadata?.errors,
        },
      })
    }

    // Generic error handler
    logger.error("Sale processing failed", {
      error: error.stack,
      userId: req.user._id,
      body: JSON.stringify(req.body),
    })

    res.status(500).json({
      success: false,
      error: {
        code: "SALE_PROCESSING_FAILED",
        message: "Failed to finalize sale",
        referenceId: req.id, // Correlation ID
      },
    })
  }
})

// @desc    Save a sale as a quotation
// @route   POST /api/v1/tenant/sales/quotations
exports.createQuotation = asyncHandler(async (req, res, next) => {
  const quote = await salesService.createQuoteOrDraft(req.models, {
    ...req.body,
    status: "quotation",
    userId: req.user._id,
    branchId: req.user.assignedBranchId,
  })
  res.status(201).json({ success: true, data: quote })
})

// @desc    Get all sales currently on hold for the user's branch
// @route   GET /api/v1/tenant/sales/held
exports.getHeldSales = asyncHandler(async (req, res, next) => {
  const { SalesInvoice } = req.models
  const heldSales = await SalesInvoice.find({
    branchId: req.user.assignedBranchId,
    status: "on_hold",
  }).populate("customerId", "name")
  res.status(200).json({ success: true, data: heldSales })
})

// @desc    Update a sale's status (e.g., to 'on_hold' or back to 'draft')
// @route   PATCH /api/v1/tenant/sales/:id/status
exports.updateSaleStatus = asyncHandler(async (req, res, next) => {
  const { SalesInvoice } = req.models
  const { status, holdReason } = req.body
  const sale = await SalesInvoice.findById(req.params.id)

  if (!sale) return res.status(404).json({ success: false, error: "Sale not found." })

  // Add business logic validation here, e.g., only a 'draft' can be put 'on_hold'

  sale.status = status
  if (holdReason) sale.holdReason = holdReason

  await sale.save()
  res.status(200).json({ success: true, data: sale })
})

// @desc    Calculate all totals, discounts, and taxes for a given cart in real-time.
// @route   POST /api/v1/tenant/sales/calculate-totals
exports.calculateTotals = asyncHandler(async (req, res, next) => {
  const { cartData, customerId, branchId } = req.body

  const calculatedCart = await salesCalculationService.calculateCartTotals(req.models, {
    cartData,
    customerId,
    branchId,
  })

  console.log(calculatedCart)

  res.status(200).json({ success: true, data: calculatedCart })
})

// @desc    Delete a draft or on_hold sale
// @route   DELETE /api/v1/tenant/sales/:id
exports.deleteDraftOrHold = asyncHandler(async (req, res, next) => {
  const { SalesInvoice } = req.models
  const sale = await SalesInvoice.findById(req.params.id)

  if (!sale) {
    return res.status(404).json({ success: false, error: "Sale not found." })
  }

  // CRITICAL: Only allow deletion of non-completed, non-financial transactions.
  if (!["draft", "on_hold", "quotation"].includes(sale.status)) {
    return res.status(400).json({ success: false, error: `Cannot delete a sale with status '${sale.status}'.` })
  }

  await sale.deleteOne()
  res.status(200).json({ success: true, data: {} })
})

/**
 * @desc    Get all sales invoices with advanced filtering, sorting, and pagination.
 * @route   GET /api/v1/tenant/sales/invoices
 * @access  Private (Requires 'sales:invoice:view' permission)
 */
exports.getAllInvoices = asyncHandler(async (req, res, next) => {
  const { SalesInvoice } = req.models
  const {
    page = 1,
    limit = 25,
    search,
    paymentStatus,
    workflowStatus,
    customerId,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query
  const skip = (page - 1) * limit

  // 1. Build the initial match stage for filtering
  const matchStage = {}
  if (paymentStatus) matchStage.paymentStatus = paymentStatus
  if (workflowStatus) matchStage.workflowStatus = workflowStatus
  if (customerId) matchStage.customerId = new mongoose.Types.ObjectId(customerId)
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) }
  }

  // 2. Build the aggregation pipeline
  const pipeline = [
    { $match: matchStage },
    // Populate customer details
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    // Add a search stage if a search term is provided
    {
      $match: search
        ? {
            $or: [{ invoiceId: { $regex: search, $options: "i" } }, { "customer.name": { $regex: search, $options: "i" } }],
          }
        : {},
    },
    // Add sorting
    { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
  ]

  // 3. Execute queries in parallel for efficiency
  const [results, total] = await Promise.all([
    SalesInvoice.aggregate([...pipeline, { $skip: skip }, { $limit: Number(limit) }]),
    SalesInvoice.aggregate([...pipeline, { $count: "total" }]),
  ])

  const totalCount = total[0]?.total || 0

  res.status(200).json({
    success: true,
    total: totalCount,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
    },
    data: results,
  })
})

/**
 * @desc    Get a single sales invoice by its ID
 * @route   GET /api/v1/tenant/sales/:id
 * @access  Private (Requires 'sales:invoice:view' permission)
 */
exports.getSaleById = asyncHandler(async (req, res, next) => {
  const { SalesInvoice } = req.models
  const invoice = await SalesInvoice.findById(req.params.id).populate("customerId", "name email phone") // Populate customer details

  if (!invoice) {
    return res.status(404).json({ success: false, error: "Sales invoice not found." })
  }

  res.status(200).json({ success: true, data: invoice })
})
