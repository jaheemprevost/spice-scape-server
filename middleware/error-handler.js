const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Something went wrong, please try again later'
  }

  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors).map(prop => prop.message).join(','); 
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${err.keyValue} field, please choose another value.`;

    customError.statusCode = 400;
  }

  if (err.name === 'CastError') {
    customError.message = `No item found with id: ${err.value}`;
    customError.statusCode = 404;
  }

  return res.status(customError.statusCode).json({message: customError.message});
};

module.exports = errorHandlerMiddleware;
