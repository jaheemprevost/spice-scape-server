// Groups and exports custom errors for ease of use (via destructuring);
const BadRequestError = require('./bad-request');
const InternalServerError = require('./internal-server');
const NotFoundError = require('./not-found');
const UnauthenticatedError = require('./unauthenticated');

module.exports = {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthenticatedError
};
