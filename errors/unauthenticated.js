const CustomAPIError = require('./custom');

// Creates custom error to be used when dealing with authentication errors.
class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 401;

  }
}

module.exports = UnauthenticatedError;
