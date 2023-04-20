const CustomAPIError = require('./custom');

// Creates custom error to be used when dealing with not found errors.
class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 404;

  }
}

module.exports = NotFoundError;
