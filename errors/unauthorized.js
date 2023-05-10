const CustomAPIError = require('./custom');

// Creates custom error to be used when dealing with unauthorized errors.
class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 403;

  }
}

module.exports = UnauthorizedError;
