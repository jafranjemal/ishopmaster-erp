// errors/saleErrors.js
class SaleError extends Error {
  constructor(code, message, metadata = {}) {
    super(message);
    this.code = code;
    this.metadata = metadata;
  }
}

class ValidationError extends SaleError {
  constructor(errors) {
    super("VALIDATION_FAILED", "Sale data validation failed", { errors });
  }
}
