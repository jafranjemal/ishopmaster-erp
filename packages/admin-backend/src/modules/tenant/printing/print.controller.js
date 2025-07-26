const asyncHandler = require("../../../middleware/asyncHandler")

exports.createPrintJob = asyncHandler(async (req, res, next) => {
  const { PrintJob } = req.models
  const jobData = {
    ...req.body,
    createdBy: req.user._id,
    branchId: req.user.assignedBranchId,
    // workstationId would come from the Hardware Bridge or a header
  }
  const printJob = await PrintJob.create(jobData)
  res.status(201).json({ success: true, data: printJob })
})

exports.getPrintQueue = asyncHandler(async (req, res, next) => {
  const { PrintJob } = req.models
  // This endpoint is for the Hardware Bridge to poll for new jobs
  const queue = await PrintJob.find({
    status: "pending",
    branchId: req.user.assignedBranchId, // Or filter by workstationId
  }).sort({ createdAt: 1 })
  res.status(200).json({ success: true, data: queue })
})

exports.updatePrintJobStatus = asyncHandler(async (req, res, next) => {
  const { PrintJob } = req.models
  const { status, failureReason } = req.body
  const job = await PrintJob.findByIdAndUpdate(req.params.id, { status, failureReason }, { new: true, runValidators: true })
  if (!job) return res.status(404).json({ success: false, error: "Print job not found." })
  res.status(200).json({ success: true, data: job })
})
