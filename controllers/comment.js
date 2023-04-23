const Recipe = require('../models/recipe');
const User = require('../models/user');
const Comment = require('../models/comment');
const {commentCreationSchema, commentRevisionValidator} = require('../utils/joi');
const {BadRequestError, NotFoundError, UnauthenticatedError} = require('../errors');


// Retrieves all comments from database and serves them.
const getComments = async (req, res) => {
  const comments = await Comment.find({});

  if (comments.length < 1) {
    return res.status(200).json({message: "There aren't any comments yet."});
  }

  res.status(200).json({message: 'Success', comments});
};

// Retrieves a specific comment from database and serve it.
const getComment = async(req, res) => {
  const {commentId} = req.params;

  const comment = await Comment.findOne({_id: commentId});
  
   // If recipe does not exist throw not found error.
   if (!comment) {
    throw new NotFoundError('The comment you are looking for does not exist.');
  }

  res.status(200).json({message: 'Success', comment});
}

module.exports = {
  getComments, 
  getComment,
};
