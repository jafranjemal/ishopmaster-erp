const asyncHandler = require("../../../../middleware/asyncHandler")

exports.getAllHardware = asyncHandler(async (req, res, next) => {
  const { HardwareDevice } = req.models
  const devices = await HardwareDevice.find(req.query).populate("branchId", "name").sort({ name: 1 })
  res.status(200).json({ success: true, data: devices })
})

exports.createHardware = asyncHandler(async (req, res, next) => {
  const { HardwareDevice } = req.models
  const device = await HardwareDevice.create(req.body)
  res.status(201).json({ success: true, data: device })
})

exports.getHardwareById = asyncHandler(async (req, res, next) => {
  const { HardwareDevice } = req.models
  const device = await HardwareDevice.findById(req.params.id).populate("branchId", "name")
  if (!device) return res.status(404).json({ success: false, error: "Hardware device not found." })
  res.status(200).json({ success: true, data: device })
})

exports.updateHardware = asyncHandler(async (req, res, next) => {
  const { HardwareDevice } = req.models
  const device = await HardwareDevice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!device) return res.status(404).json({ success: false, error: "Hardware device not found." })
  res.status(200).json({ success: true, data: device })
})

exports.deleteHardware = asyncHandler(async (req, res, next) => {
  const { HardwareDevice } = req.models
  const device = await HardwareDevice.findByIdAndDelete(req.params.id)
  if (!device) return res.status(404).json({ success: false, error: "Hardware device not found." })
  res.status(200).json({ success: true, data: {} })
})
