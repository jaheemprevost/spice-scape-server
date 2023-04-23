const User = require('../models/user');
const { userCreationSchema, userLoginSchema } = require('../utils/joi');
const BadRequestError = require('../errors/bad-request');




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

  res.json({message: 'success', user});
}

const loginUser = async (req, res) => {
  const {value, error} = userLoginSchema.validate(req.body);

  if (error) {
    const message = error.details[0].message
    throw new BadRequestError(message);
  }

  res.send('This will authenticate the user.');
}

module.exports = {
  getRegister,
  getLogin,
  registerUser,
  loginUser
};
