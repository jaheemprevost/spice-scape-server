const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const authMiddleware = (req, res, next) => {
  const {token} = req.cookies;
  
  if (!token) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {userId: payload.userId};

    next();
  } catch(error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
}

module.exports = authMiddleware;
