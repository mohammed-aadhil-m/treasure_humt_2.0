const { ApiError } = require('../utils/ApiError');

// Central error handler. Keeps error responses in one consistent shape and
// never leaks stack traces or internal details to the client.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';

  if (statusCode === 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({ success: false, message });
}

module.exports = { errorHandler };
