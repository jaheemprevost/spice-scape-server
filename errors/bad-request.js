const CustomAPIError = require('./custom');

// Creates custom error to be used when dealing with bad requests
class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
