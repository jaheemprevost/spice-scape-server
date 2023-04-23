// Groups and exports custom errors for ease of use (via destructuring);
const BadRequestError = require('./bad-request');
const NotFoundError = require('./not-found');
const UnauthenticatedError = require('./unauthenticated');

module.exports = {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError
};
