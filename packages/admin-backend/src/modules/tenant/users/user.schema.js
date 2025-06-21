const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 6,
      select: false, // Security: Do not send password in queries by default
    },
    phone: {
      type: String,
      trim: true,
    },
    address: addressSchema,
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "A user must be assigned a role."],
    },
    assignedBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "A user must be assigned to a branch."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = userSchema;
