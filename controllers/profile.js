const User = require('../models/user');
const { profileRevisionSchema } = require('../utils/joi');
const {NotFoundError, BadRequestError, UnauthenticatedError}= require('../errors');

// Get specific profile associated with id in the request parameters.
const getProfile = async (req, res) => {
  const {profileId} = req.params;

  const user = await User.findOne({_id: profileId});

  // If the user doesn't exist throw 404 not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist.');
  }

  res.status(200).json({message: 'Success', user});
};

// Edit the user profile associated with the specific request parameter.
const editProfile = async (req, res) => {
  const { profileId } = req.params;

  // Temporary user account created to test controllers before authentication is implemented
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 

  const user = await User.findOne({_id: profileId});

  // If the user doesn't exist throw 404 not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist.');
  }

  // If the user profile's id doesn't match the current user's throw 401 not authorized error
  if (user._id.toString() !== userId) {
    throw new UnauthenticatedError('You are not authorized to modify this profile')
  } 

  // Validates user input.
  const {value, error} = profileRevisionSchema.validate(req.body); 
  
  // If input validation fails throw 400 bad request error.
  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message);
  }  

  user.set(value);
  await user.save({new: true, runValidators: true});

  res.status(200).json({message: 'Success', user});
};

const deleteProfile = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
  const { profileId } = req.params;

  const user = await User.findOne({_id: profileId});

  if (!user) {
    throw new NotFoundError('This user does not exist.');
  }

  // If the user profile's id doesn't match the current user's throw 401 not authorized error
  if (user._id.toString() !== userId) {
    throw new UnauthenticatedError('You are not authorized to modify this profile')
  }

  await User.updateMany({},{$pull: {followers: user.id_}});
  await User.updateMany({},{$pull: {followedCooks: user._id}});
  await User.findOneAndDelete({_id: profileId});

  res.status(200).json({message: 'Success', user});
};

const getFollowers = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
  const { profileId } = req.params;

  /* Instructions on how to populate various fields inside of document. */
  const populateOptions = {
    path: 'followers',
    select: 'username profileImage _id'
  };

  // Finds specified User and populates the necessary documents. 
  const user = await User.findOne({_id: profileId}).populate(populateOptions);

  // If user doesn't exist throw 404 not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist');
  }

  const followers = user.followers.map(follower => {
    return {
      username: follower.username,
      profileImage: follower.profileImage,
      id: follower._id
    };
  });

  if (followers.length < 1) {
    return res.status(200).json({message: 'This user has no followers'});
  } else {
    res.status(200).json({message: 'Success', followers});
  }
}

const getFollowing = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
  const { profileId } = req.params;

   /* Instructions on how to populate various fields inside of document. */
   const populateOptions = {
    path: 'followedCooks',
    select: 'username profileImage _id'
  };

  // Finds specified User and populates the necessary documents. 
  const user = await User.findOne({_id: profileId}).populate(populateOptions);

  // If user doesn't exist throw 404 not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist');
  }

  const followedCooks = user.followedCooks.map(cook => {
    return {
      username: cook.username,
      profileImage: cook.profileImage,
      id: cook._id
    };
  });

  if (followedCooks.length < 1) {
    return res.status(200).json({message: "This user isn't following anyone"});
  } else {
    res.status(200).json({message: 'Success', followedCooks});
  }
};

const followUser = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
  const { profileId } = req.params;

  const user = await User.findOne({_id: profileId});

  // If user doesn't exist throw not found error.
  if (!user) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  } 

  // If profile belongs to current user throw unauthorized error.
  if (user._id.toString() === userId) { 
    throw new UnauthenticatedError("You can't follow yourself!");
  }
  
  // If current user is already in profiled user's follower list throw bad request error.
  if (user.followers.includes(userId)) {
    throw new BadRequestError("You've already followed this user!");
  }

  await User.updateOne({_id: profileId}, {$push: { followers: userId }});
  await User.updateOne({_id: userId}, {$push: { followedCooks: profileId }});

  res.status(200).json({message: 'You followed this user'});
}

const unfollowUser = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
  const { profileId } = req.params;

  const user = await User.findOne({_id: profileId});

  // If user doesn't exist throw not found error.
  if (!user) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  } 

  // If profile belongs to current user throw unauthorized error.
  if (user._id.toString() === userId) { 
    throw new UnauthenticatedError("You can't unfollow yourself!");
  }
  
  // If current user is not in profiled user's follower list throw bad request error.
  if (!user.followers.includes(userId)) {
    throw new BadRequestError("You're not following this user!");
  }

  await User.updateOne({_id: profileId}, {$pull: { followers: userId }});
  await User.updateOne({_id: userId}, {$pull: { followedCooks: profileId }});

  res.status(200).json({message: 'You have unfollowed this user'});
}  

module.exports = {
  getProfile,
  editProfile,
  deleteProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser 
};
