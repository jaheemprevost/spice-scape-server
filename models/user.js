const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    minLength: 6,
    maxLength: 16,
    required: [true, 'Please enter a username']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a password']
  },
  profileImage: {
    publicId: {
      type: 'String',
      default: '321',
      required: true
    },
    url: {
      type: 'String',
      default: 'https://res.cloudinary.com/dhscoasnw/image/upload/v1682015580/default-user_re7kkp.png',
      required: true
    }
  },
  biography: {
    type: String,
    minLength: 49,
    maxLength: 250,
    default: 'The backstory of this user is yet to be revealed.',
    required: true
  }, 
  recipes: [{type: mongoose.Types.ObjectId, ref: 'Recipe'}],
  favoriteRecipes: [{type: mongoose.Types.ObjectId, ref: 'Recipe'}],
  comments: [{type: mongoose.Types.ObjectId, ref: 'Comment'}],
  followedCooks: [{type: mongoose.Types.ObjectId, ref: 'User'}],
  followers: [{type: mongoose.Types.ObjectId, ref: 'User'}] 
});

userSchema.pre('save', async function() {
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.createAccessToken = function() {
  return jwt.sign({userId: this._id, username: this.username}, process.env.TOKEN_SECRET, {expiresIn: process.env.EXPIRES_IN});
};

userSchema.methods.comparePassword = async function(inputtedPassword) {
  const successfulMatch = await bcrypt.compare(inputtedPassword, this.password);

  return successfulMatch;
};

module.exports = mongoose.model('User', userSchema);
