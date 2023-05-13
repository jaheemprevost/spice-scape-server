const express = require('express');
const router = express.Router();

const {
  getProfile,
  editProfile,
  deleteProfile,
  getProfileRecipes,
  getFavoriteRecipes,
  getProfileComments,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser 
} = require('../controllers/profile');

router.route('/:profileId').get(getProfile).patch(editProfile).delete(deleteProfile);
router.route('/:profileId/followers').get(getFollowers);
router.route('/:profileId/following').get(getFollowing);
router.route('/:profileId/recipes').get(getProfileRecipes);
router.route('/:profileId/favorite-recipes').get(getFavoriteRecipes);
router.route('/:profileId/comments').get(getProfileComments);
router.route('/:profileId/follow').post(followUser).delete(unfollowUser);
 
module.exports = router;
