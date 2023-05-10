const User = require('../models/user'); 
const { userCreationSchema, userLoginSchema } = require('../utils/joi');
const { BadRequestError, NotFoundError } = require('../errors');

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
  
  res.status(200).json({user: {
    name: user.username,
    profileImage: user.profileImage,
    biography: user.biography,
    userId: user._id
  }, accessToken}); 
}
  
module.exports = {
  registerUser,
  loginUser, 
};
