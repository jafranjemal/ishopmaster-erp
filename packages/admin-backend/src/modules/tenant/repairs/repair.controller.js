const asyncHandler = require("../../../middleware/asyncHandler");
const invoiceSynthesisService = require("../../../services/invoiceSynthesis.service");
const repairService = require("../../../services/repair.service"); // Assuming service is in a central location
const technicianService = require("../../../services/technician.service");

// @desc    Create a new repair ticket
// @route   POST /api/v1/tenant/repairs/tickets
exports.createRepairTicket = asyncHandler(async (req, res, next) => {
  const { ticket, portalToken } = await repairService.createTicket(req.models, req.body, req.user._id, req.user.assignedBranchId);
  res.status(201).json({ success: true, data: { ticket, portalToken } });
});

/**
 * @desc    Add an item to a repair ticket's job sheet
 * @route   POST /api/v1/tenant/repairs/tickets/:id/jobsheet/items
 * @access  Private (Requires 'service:ticket:update' permission)
 */
exports.addItemToJobSheet = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    console.log("repair service item adding.. ", req.body);
    await session.withTransaction(async () => {
      ticket = await repairService.addItemToServiceJobSheet(
        req.models,
        {
          ticketId: req.params.id,
          itemData: req.body,
          userId: req.user._id,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Remove an item from a repair ticket's job sheet
 * @route   DELETE /api/v1/tenant/repairs/tickets/:id/jobsheet/items/:itemId
 * @access  Private (Requires 'service:ticket:update' permission)
 */
exports.removeItemFromJobSheet = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    await session.withTransaction(async () => {
      ticket = await repairService.removeItemFromJobSheet(
        req.models,
        {
          ticketId: req.params.id,
          jobSheetItemId: req.params.itemId,
          userId: req.user._id,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

// @desc    Get all repair tickets with filtering and pagination
// @route   GET /api/v1/tenant/repairs/tickets
exports.getAllRepairTickets = asyncHandler(async (req, res, next) => {
  // In a real app, this would call a service method with pagination and filters
  const { RepairTicket } = req.models;
  console.log(req.query);
  console.log("RepairTicket model paths:", Object.keys(req.models.RepairTicket.schema.obj));
  const tickets = await RepairTicket.find(req.query)
    .populate("customerId", "name")
    .populate("assignedTo", "firstName lastName")
    .populate({
      path: "assets",
      populate: { path: "deviceId", select: "name" },
    })
    .populate("finalInvoiceId") // This will embed the full SalesInvoice object

    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: tickets });
});

/**
 * @desc    Update core details of a repair ticket
 * @route   PUT /api/v1/tenant/repairs/tickets/:id
 * @access  Private (Requires 'service:ticket:update' permission)
 */
exports.updateTicket = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    await session.withTransaction(async () => {
      ticket = await repairService.updateTicketDetails(req.models, { ticketId: req.params.id, updateData: req.body }, session);
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Delete a repair ticket
 * @route   DELETE /api/v1/tenant/repairs/tickets/:id
 * @access  Private (Requires 'service:ticket:delete' permission)
 */
exports.deleteTicket = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await repairService.deleteTicket(req.models, { ticketId: req.params.id }, session);
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Confirm the physical pickup of a repaired device and close the ticket.
 * @route   POST /api/v1/tenant/repairs/tickets/:id/confirm-pickup
 * @access  Private (Requires 'sales:pos:access' or similar)
 */
exports.confirmPickup = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    await session.withTransaction(async () => {
      ticket = await repairService.confirmDevicePickup(
        req.models,
        {
          ticketId: req.params.id,
          userId: req.user._id,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Add "After Repair" photos to a repair ticket
 * @route   POST /api/v1/tenant/repairs/tickets/:id/after-photos
 * @access  Private (Requires 'service:ticket:update' permission)
 */
exports.addAfterPhotos = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    await session.withTransaction(async () => {
      ticket = await repairService.addAfterPhotos(req.models, { ticketId: req.params.id, photos: req.body.photos }, session);
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

// @desc    Get a single repair ticket by ID
// @route   GET /api/v1/tenant/repairs/tickets/:id
exports.getRepairTicketById = asyncHandler(async (req, res, next) => {
  const { RepairTicket } = req.models;
  console.log("RepairTicket model paths:", Object.keys(req.models.RepairTicket.schema.paths));
  const ticket = await RepairTicket.findById(req.params.id)
    .populate([
      { path: "customerId" },
      { path: "assignedTo" },
      { path: "finalInvoiceId" },
      {
        path: "assets",
        populate: { path: "deviceId" },
      },
    ])
    .lean() // optional: returns plain JS objects rather than Mongoose Documents
    .exec();
  console.log(ticket.assignedTo);
  if (!ticket) return res.status(404).json({ success: false, error: "Repair ticket not found." });
  res.status(200).json({ success: true, data: ticket });
});

/**
 * @desc    Get the full status history for a single repair ticket
 * @route   GET /api/v1/tenant/repairs/tickets/:id/history
 * @access  Private (Requires 'service:ticket:view' permission)
 */
exports.getTicketHistory = asyncHandler(async (req, res, next) => {
  const { RepairTicketHistory } = req.models;
  const history = await RepairTicketHistory.find({ ticketId: req.params.id }).populate("changedBy", "name").sort({ createdAt: 1 }); // Sort oldest to newest for a chronological timeline

  res.status(200).json({ success: true, data: history });
});

// @desc    Update the status of a repair ticket
// @route   PATCH /api/v1/tenant/repairs/tickets/:id/status
exports.updateTicketStatus = asyncHandler(async (req, res, next) => {
  const { newStatus } = req.body;
  const updatedTicket = await repairService.updateTicketStatus(req.models, {
    ticketId: req.params.id,
    newStatus,
    userId: req.user._id,
  });
  res.status(200).json({ success: true, data: updatedTicket });
});

/**
 * @desc    Update the status of a repair ticket's troubleshoot fee
 * @route   PATCH /api/v1/tenant/repairs/tickets/:id/troubleshoot-fee
 * @access  Private
 */
exports.updateTroubleshootFeeStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  // Permission check inside the controller for clarity
  if (status === "waived" && !req.user.role.permissions.includes("service:ticket:waive_fees")) {
    return res.status(403).json({ success: false, error: "You do not have permission to waive fees." });
  }

  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    await session.withTransaction(async () => {
      ticket = await repairService.updateTroubleshootFeeStatus(
        req.models,
        { ticketId: req.params.id, newStatus: status, userId: req.user._id },
        session
      );
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Manually generate a SalesInvoice from a completed repair ticket.
 * @route   POST /api/v1/tenant/repairs/tickets/:id/generate-invoice
 * @access  Private (Requires 'sales:invoice:create' permission)
 */
exports.generateInvoice = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let salesInvoice;
  try {
    await session.withTransaction(async () => {
      salesInvoice = await invoiceSynthesisService.createInvoiceFromRepair(
        req.models,
        {
          ticketId: req.params.id,
          userId: req.user._id,
        },
        session,
        req.tenant
      );
    });
    res.status(201).json({ success: true, data: salesInvoice });
  } finally {
    session.endSession();
  }
});

// @desc    Assign a technician to a repair ticket
// @route   PUT /api/v1/tenant/repairs/tickets/:id/assign
exports.assignTechnician = asyncHandler(async (req, res, next) => {
  const { employeeId } = req.body;
  const updatedTicket = await technicianService.assignTechnician(req.models, {
    ticketId: req.params.id,
    employeeId,
  });
  res.status(200).json({ success: true, data: updatedTicket });
});

/**
 * @desc    Submit the results of a Quality Control check
 * @route   POST /api/v1/tenant/repairs/tickets/:id/submit-qc
 * @access  Private (Requires 'service:qc:perform' permission)
 */
exports.submitQcCheck = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    await session.withTransaction(async () => {
      ticket = await repairService.submitQcCheck(
        req.models,
        {
          ticketId: req.params.id,
          qcData: req.body,
          userId: req.user._id,
        },
        session,
        req.tenant
      );
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Get a ticket's details along with its assigned QC template
 * @route   GET /api/v1/tenant/repairs/tickets/:id/qc-details
 * @access  Private (Requires 'service:qc:perform' permission)
 */

/**
 * @desc    Get a ticket's details along with its assigned QC template
 * @route   GET /api/v1/tenant/repairs/tickets/:id/qc-details
 * @access  Private (Requires 'service:qc:perform' permission)
 */
exports.getQcDetails = asyncHandler(async (req, res, next) => {
  const { RepairTicket } = req.models;
  const ticket = await RepairTicket.findById(req.params.id).populate("qcTemplateId"); // Populate the full template document

  console.log("getQcDetails ==> ticket ", ticket);
  if (!ticket) {
    return res.status(404).json({ success: false, error: "Repair ticket not found." });
  }
  if (!ticket.qcTemplateId) {
    return res.status(400).json({ success: false, error: "No QC template is assigned to this repair ticket." });
  }
  res.status(200).json({ success: true, data: ticket.qcTemplateId }); // Return just the template
});

/**
 * @desc    Flag a repair ticket for re-quoting by a service advisor
 * @route   POST /api/v1/tenant/repairs/tickets/:id/flag-for-requote
 * @access  Private (Requires 'service:ticket:update' permission)
 */
exports.flagForRequote = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let ticket;
  try {
    await session.withTransaction(async () => {
      ticket = await repairService.flagForRequote(
        req.models,
        {
          ticketId: req.params.id,
          userId: req.user._id,
          notes: req.body.notes,
        },
        session
      );
    });
    res.status(200).json({ success: true, data: ticket });
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Get all tickets assigned to the currently logged-in technician, grouped by status.
 * @route   GET /api/v1/tenant/repairs/tickets/my-queue
 * @access  Private (Technician's own tickets)
 */
exports.getMyTickets = asyncHandler(async (req, res, next) => {
  const { RepairTicket, Employee } = req.models;

  // 1. Find the Employee record for the logged-in User
  const employee = await Employee.findOne({ userId: req.user._id }).lean();
  if (!employee) {
    // If the user is not an employee, they have no assigned tickets.
    return res.status(200).json({ success: true, data: {} });
  }

  // 2. Use an aggregation pipeline to fetch and group tickets
  const ticketsByStatus = await RepairTicket.aggregate([
    // Match tickets assigned to this employee that are not in a final state
    {
      $match: {
        assignedTo: employee._id,
        status: { $nin: ["closed", "cancelled"] },
      },
    },
    // Sort by creation date to have the oldest tickets first in each group
    { $sort: { createdAt: 1 } },
    // Populate necessary details for the Kanban cards
    { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
    { $lookup: { from: "assets", localField: "assets", foreignField: "_id", as: "assetDetails" } },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    // Group by status
    {
      $group: {
        _id: "$status",
        tickets: { $push: "$$ROOT" },
      },
    },
    // Reshape the output to be { statusName: [tickets] }
    {
      $group: {
        _id: null,
        statuses: { $push: { k: "$_id", v: "$tickets" } },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $arrayToObject: "$statuses" },
      },
    },
  ]);

  // The result of the aggregation is an array with one object, or an empty array.
  const result = ticketsByStatus[0] || {};

  res.status(200).json({ success: true, data: result });
});
