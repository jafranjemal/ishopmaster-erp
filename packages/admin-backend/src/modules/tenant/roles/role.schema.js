const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required."],
      trim: true,
      // This unique index will be scoped to each tenant's database automatically.
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isDeletable: {
      type: Boolean,
      default: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = roleSchema;
