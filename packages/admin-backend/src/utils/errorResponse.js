/**
 * A custom Error class for creating structured, detailed error responses.
 * This allows us to send consistent error objects with specific HTTP status codes
 * and custom internal error codes from anywhere in our application.
 */
class ErrorResponse extends Error {
  /**
   * @param {string} message - The human-readable error message.
   * @param {number} statusCode - The HTTP status code (e.g., 404, 400, 403).
   * @param {string} [errorCode] - An optional, machine-readable code for the frontend (e.g., 'LICENSE_EXPIRED').
   */
  constructor(message, statusCode, errorCode) {
    // Call the parent constructor (Error) with the message
    super(message);

    // Add our custom properties to the error object
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    // This captures the stack trace for easier debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
