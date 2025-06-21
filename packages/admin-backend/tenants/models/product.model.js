const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true, // SKU should be unique within a single tenant's database
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This will reference a User within the same tenant DB
    },
  },
  { timestamps: true }
);

// Note: We do not compile the model here.
// It will be compiled on a per-tenant connection basis in the database service.
module.exports = productSchema;
