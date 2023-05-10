const express = require('express');
const router = express.Router();

const {
  getProfile,
  editProfile,
  deleteProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser 
} = require('../controllers/profile');

router.route('/:profileId').get(getProfile).patch(editProfile).delete(deleteProfile);
router.route('/:profileId/followers').get(getFollowers);
router.route('/:profileId/following').get(getFollowing);
router.route('/:profileId/follow').post(followUser).delete(unfollowUser);
 
module.exports = router;
