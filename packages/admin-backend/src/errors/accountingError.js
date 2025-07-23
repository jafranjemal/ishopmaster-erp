class AccountingError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AccountingError";
    this.code = code;
  }
}
module.exports = AccountingError;
