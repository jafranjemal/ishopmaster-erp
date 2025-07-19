class PaymentError extends Error {
  constructor({ code, message, details = {}, statusCode = 400 }) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        details: this.details,
        statusCode: this.statusCode,
        stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
      },
    };
  }
}

// Specific error types
class PaymentValidationError extends PaymentError {
  constructor(details) {
    super({
      code: "PAYMENT_VALIDATION_FAILED",
      message: "Payment validation failed",
      details,
      statusCode: 422,
    });
  }
}

class PaymentMethodError extends PaymentError {
  constructor(methodId) {
    super({
      code: "INVALID_PAYMENT_METHOD",
      message: "Specified payment method is invalid",
      details: { methodId },
      statusCode: 400,
    });
  }
}

class InsufficientFundsError extends PaymentError {
  constructor(balance, required) {
    super({
      code: "INSUFFICIENT_FUNDS",
      message: "Account has insufficient funds",
      details: { currentBalance: balance, requiredAmount: required },
      statusCode: 402,
    });
  }
}

module.exports = {
  PaymentError,
  PaymentValidationError,
  PaymentMethodError,
  InsufficientFundsError,
};
