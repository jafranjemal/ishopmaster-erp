const mongoose = require('mongoose');
// We will use bcryptjs to hash passwords, a crucial security measure
// const bcrypt = require('bcryptjs'); 

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
}, { timestamps: true });

// Password Hashing Middleware (we will implement this in the auth chapter)
// adminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
// This model will be used to manage admin users in the central admin database
// It includes fields for email and password, with basic validation.