const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  name: {
    // e.g., "Point of Sale"
    type: String,
    required: true,
    trim: true,
  },
  key: {
    // e.g., "pos"
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isGloballyActive: {
    type: Boolean,
    default: true,
  },
});

const Module = mongoose.model("Module", moduleSchema);
module.exports = Module;
