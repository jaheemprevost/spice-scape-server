const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticationMiddleware = require('../middleware/authentication');

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
}
= require('../controllers/auth');

// Limit user to a maximum of 10 requests per 1 hour interval.
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many consecutive attempts have been made, please try again in 1 hour.',
  standardHeaders: true,
  legacyHeaders: false
})

router.route('/register').post(limiter, registerUser);
router.route('/login').post(limiter, loginUser);
router.route('/refresh').post(refreshAccessToken);
router.route('/logout').post(authenticationMiddleware, logoutUser);

module.exports = router;
