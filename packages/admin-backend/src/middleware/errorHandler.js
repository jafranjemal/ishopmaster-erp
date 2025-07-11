const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  if (!error.message) {
    error.message = "Something went wrong";
  }
  error.message = err.message;

  // Log to console for the developer
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, error: message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let field = "unknown";
    try {
      field = err.keyValue ? Object.keys(err.keyValue)[0] : "unknown";
    } catch (e) {
      console.warn("Failed to extract duplicate key field:", e);
    }
    const message = `Duplicate field value entered for '${field}'. Please use another value.`;
    return res.status(400).json({ success: false, error: message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return res.status(400).json({ success: false, error: message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    ...(error.errorCode && { errorCode: error.errorCode }),
  });
};

module.exports = errorHandler;
