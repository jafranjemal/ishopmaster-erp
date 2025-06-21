const jwt = require('jsonwebtoken');

/**
 * Generates a JWT for a given user ID.
 * @param {string} id The user's ID.
 * @returns {string} The generated JWT.
 */
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};