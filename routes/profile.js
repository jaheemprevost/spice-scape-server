const express = require('express');
const router = express.Router();

const {
  getProfile,
  editProfile,
  deleteProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  favoriteRecipe,
  unfavoriteRecipe
} = require('../controllers/profile');

router.route('/:id').get(getProfile).patch(editProfile).delete(deleteProfile);
router.route('/:id/followers').get(getFollowers);
router.route('/:id/following').get(getFollowing);
router.route('/:id/follow').post(followUser).delete(unfollowUser);
 
module.exports = router;
