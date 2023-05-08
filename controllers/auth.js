const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { userCreationSchema, userLoginSchema } = require('../utils/joi');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');

// validates user input against Schema and saves user to database if valid.
const registerUser = async (req, res) => {
  const {value, error} = userCreationSchema.validate(req.body);

  if (error) {
    const message = error.details[0].message
    throw new BadRequestError(message);
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

  res.cookie('refreshToken', refreshToken,  {
    httpOnly: false,  
    sameSite: 'None',
    secure: true, 
    maxAge: process.env.REFRESH_EXPIRES_IN,
    domain: 'https://spice-scape-server.onrender.com'
  });

  res.status(200).json({user: {
    name: user.username,
    profileImage: user.profileImage,
    biography: user.biography,
    userId: user._id
  }, accessToken}); 
}

const refreshAccessToken = async(req, res) => {
  let { refreshToken } = req.cookies; 

  if (!refreshToken) {
    throw new UnauthenticatedError('Authentication failed');
  }
  
  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); 

  const foundUser = await User.findOne({_id: payload.userId});

  if (!foundUser) {
    throw new NotFoundError('This user does not exist');
  }

  const accessToken = foundUser.createAccessToken(); 
  refreshToken = foundUser.createRefreshToken(); 

  res.cookie('refreshToken', refreshToken,  {
    httpOnly: true,  
    sameSite: 'None',
    secure: true, 
    maxAge: process.env.REFRESH_EXPIRES_IN,
    domain: 'https://spice-scape-server.onrender.com'
  });

  res.status(200).json({accessToken});
};

const logoutUser = async (req, res) => { 
  const cookies = req.cookies;

  console.log(cookies);
  if (!cookies.refreshToken) { 
    return res.status(204).json({message: 'No cookie found'});
  }

  res.clearCookie('refreshToken', {
    httpOnly: true, 
    secure: true,  
    sameSite: 'None',
    domain: 'https://spice-scape-server.onrender.com'
  });

  res.status(200).json({message: 'User successfully logged out'});
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};
