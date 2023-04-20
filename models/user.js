const mongoose = require('mongoose');
 
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
    type: String,
    default: 'https://res.cloudinary.com/dhscoasnw/image/upload/v1682015580/default-user_re7kkp.png',
    required: [true, 'Please provide image url']
  },
  biography: {
    type: String,
    minLength: 50,
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

module.exports = mongoose.model('User', userSchema);
