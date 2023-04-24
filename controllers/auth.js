const User = require('../models/user');
const { userCreationSchema, userLoginSchema } = require('../utils/joi');
const { BadRequestError, NotFoundError } = require('../errors');
const getRegister = async (req, res) => { 
  res.send('This is the registration page.');
}

const getLogin = async (req, res) => {
  res.send('This is the log in page');
};

// validates user input against Schema and saves user to database if valid.
const registerUser = async (req, res) => {
  const {value, error} = userCreationSchema.validate(req.body);

  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message);
  }

  const user = await User.create(value);

  res.redirect('/api/v1/auth/login');
}

const loginUser = async (req, res) => {
  const {value, error} = userLoginSchema.validate(req.body);

  if (error) {
    const message = error.details[0].message
    throw new BadRequestError(message);
  }

  const user = await User.findOne({email: value.email});

  if (!user) {
    throw new NotFoundError('Invalid email or password');
  }
  
  const isMatch = await user.comparePassword(value.password);

  if (!isMatch) {
    throw new BadRequestError('Invalid email or password');
  }

  const token = user.createJWT(); 

  res.cookie('token', token, {httpOnly: true, secure: false, maxAge: 86400000});
  res.status(200).json({user: {name: user.username}}); 
}

const logoutUser = async (req, res) => {
  res.clearCookie('token', {httpOnly: true, secure: false});
  res.redirect('/api/v1/auth/login');
};

module.exports = {
  getRegister,
  getLogin,
  registerUser,
  loginUser,
  logoutUser
};
