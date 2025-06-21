const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Permission key is required (e.g., 'sales:create')"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "A human-readable description is required"],
    },
    module: {
      type: String,
      required: [true, "Module assignment is required (e.g., 'sales')"],
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", permissionSchema);
module.exports = Permission;
