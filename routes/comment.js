const express = require('express');
const router = express.Router();

const {
  getComments, 
  createComment,
  editComment,
  deleteComment
} = require('../controllers/comment');

router.route('/comments').get(getComments).post(createComment);
router.route('/comments/:id').patch(editComment).delete(deleteComment);


module.exports = router;
