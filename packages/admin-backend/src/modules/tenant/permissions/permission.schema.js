const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // Each permission key must be unique within a tenant's DB
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
});

// Note: We only export the schema. The model will be compiled dynamically.
module.exports = permissionSchema;
