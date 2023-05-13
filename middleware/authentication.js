const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) { 
    throw new UnauthenticatedError('Authentication invalid');
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(accessToken, process.env.TOKEN_SECRET);
    
    req.user = {userId: payload.userId};

    next();
  } catch(error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
}

module.exports = authMiddleware;
