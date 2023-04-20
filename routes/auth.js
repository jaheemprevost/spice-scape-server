const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  getRegister,
  getLogin,
  registerUser,
  loginUser
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

router.route('/register').get(getRegister).post(limiter, registerUser);
router.route('/login').get(getLogin).post(limiter, loginUser);

module.exports = router;
