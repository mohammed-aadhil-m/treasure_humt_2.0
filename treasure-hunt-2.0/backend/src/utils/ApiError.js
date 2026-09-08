// A small typed error so controllers can throw with an HTTP status attached,
// and the central error handler can respond consistently.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { ApiError };
