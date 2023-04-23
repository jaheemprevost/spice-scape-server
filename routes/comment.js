const express = require('express');
const router = express.Router({mergeParams: true});

const {
  getComments, 
  getComment,
} = require('../controllers/comment');

router.route('/').get(getComments);
router.route('/:id').get(getComment);

module.exports = router;
