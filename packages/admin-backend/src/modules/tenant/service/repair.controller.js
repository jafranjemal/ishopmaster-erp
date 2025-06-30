const asyncHandler = require("../../../middleware/asyncHandler");
const repairService = require("../../../services/repair.service");

exports.createTicket = asyncHandler(async (req, res, next) => {
  const newTicket = await repairService.createTicket(
    req.models,
    req.body,
    req.user._id,
    req.user.assignedBranchId
  );
  res.status(201).json({ success: true, data: newTicket });
});

exports.getAllTickets = asyncHandler(async (req, res, next) => {
  const { RepairTicket } = req.models;
  // Full pagination and filtering logic would be added here
  const tickets = await RepairTicket.find(req.query.filters || {})
    .populate("customerId", "name")
    .populate("assignedTo", "name");
  res.status(200).json({ success: true, data: tickets });
});

exports.getTicketById = asyncHandler(async (req, res, next) => {
  const { RepairTicket } = req.models;
  const ticket = await RepairTicket.findById(req.params.id)
    .populate("customerId", "name phone")
    .populate("assignedTo", "name");
  if (!ticket) return res.status(404).json({ success: false, error: "Repair ticket not found." });
  res.status(200).json({ success: true, data: ticket });
});

exports.addItemToJobSheet = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let updatedTicket;
  try {
    await session.withTransaction(async () => {
      updatedTicket = await repairService.addItemToJobSheet(req.models, {
        ticketId: req.params.id,
        itemData: req.body,
        userId: req.user._id,
      });
    });
    res.status(200).json({ success: true, data: updatedTicket });
  } finally {
    session.endSession();
  }
});

exports.removeJobSheetItem = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let updatedTicket;
  try {
    await session.withTransaction(async () => {
      updatedTicket = await repairService.removeJobSheetItem(req.models, {
        ticketId: req.params.id,
        jobSheetItemId: req.params.itemId,
        userId: req.user._id,
      });
    });
    res.status(200).json({ success: true, data: updatedTicket });
  } finally {
    session.endSession();
  }
});

exports.updateStatus = asyncHandler(async (req, res, next) => {
  const updatedTicket = await repairService.updateTicketStatus(req.models, {
    ticketId: req.params.id,
    newStatus: req.body.status,
    assignedToUserId: req.body.assignedTo,
  });
  res.status(200).json({ success: true, data: updatedTicket });
});
