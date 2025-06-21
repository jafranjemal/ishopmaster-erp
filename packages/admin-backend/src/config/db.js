const mongoose = require('mongoose');

/**
 * Establishes a connection to the central Admin MongoDB database.
 * This connection is managed as the primary/default Mongoose connection.
 */
const connectAdminDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_ADMIN);
    console.log('Central Admin MongoDB Connected...');
  } catch (err) {
    console.error(`Admin DB Connection Error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = { connectAdminDB };