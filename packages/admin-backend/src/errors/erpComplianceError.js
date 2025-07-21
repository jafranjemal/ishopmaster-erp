class ERPComplianceError extends Error {
  constructor(code, details = {}) {
    super(`ERP Compliance Violation: ${code}`);
    this.name = "ERPComplianceError";
    this.code = code;
    this.details = details;
    this.isERPCompliance = true;
    this.statusCode = 400;
    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  ERPComplianceError,
};
