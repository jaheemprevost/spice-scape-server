const CustomAPIError = require('./custom');

// Creates custom error to be used when dealing with internal server errors.
class InternalServerError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}

module.exports = InternalServerError;
