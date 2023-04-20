const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  parentPost: {
    type: mongoose.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Please provide post Id']
  },
  madeBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user Id']
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    minLength: 3,
    maxLength: 150
  }
});

module.exports = mongoose.model('Comment', commentSchema);
