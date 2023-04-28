const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { userCreationSchema, userLoginSchema } = require('../utils/joi');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
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
    throw new BadRequestError(error);
  }

  const user = await User.create(value);

  res.status(201).json({message: 'User has been successfully registered.'});
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

  const accessToken = user.createAccessToken(); 
  const refreshToken = user.createRefreshToken(); 

  res.cookie('refreshToken', refreshToken,  {httpOnly: true,  sameSite: 'None',secure: false, maxAge: process.env.REFRESH_EXPIRES_IN});

  res.status(200).json({user: {
    name: user.username,
    profileImage: user.profileImage,
    biography: user.biography
  }, accessToken}); 
}

const refreshAccessToken = async(req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new UnauthenticatedError('Authentication failed');
  }
  
  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); 

  const foundUser = await User.findOne({_id: payload.userId});

  if (!foundUser) {
    throw new NotFoundError('This user does not exist');
  }

  const accessToken = foundUser.createAccessToken(); 
  
  res.status(200).json({accessToken});
};

const logoutUser = async (req, res) => { 
  const cookies = req.cookies;

  if (!cookies.refreshToken) { 
    return res.status(204).json({message: 'No cookie found'});
  }

  res.clearCookie('refreshToken', {httpOnly: true, secure: false,  sameSite: 'None'});
  res.redirect('/api/v1/auth/login');
};

module.exports = {
  getRegister,
  getLogin,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};
