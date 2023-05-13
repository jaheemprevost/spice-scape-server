const User = require('../models/user');
const { profileRevisionSchema } = require('../utils/joi');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { NotFoundError, BadRequestError, UnauthorizedError}= require('../errors');

// Get specific profile associated with id in the request parameters.
const getProfile = async (req, res) => {
  const { userId } = req.user;
  const {profileId} = req.params;

  const user = await User.findOne({_id: profileId});

  // If the user doesn't exist throw 404 not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist.');
  }

  const userData = {
    username: user.username,
    profileImage: user.profileImage.url,
    biography: user.biography,
    followerCount: user.followers.length,
    followingCount: user.followedCooks.length
  };
  
  const currentUser = await User.findOne({_id: userId});

  const isFollowing = currentUser.followedCooks.includes(profileId);
 
  res.status(200).json({user: userData, isFollowing});
};

// Edit the user profile associated with the specific request parameter.
const editProfile = async (req, res) => {
  const { userId } = req.user; 
  const { profileId } = req.params; 

  const user = await User.findOne({_id: profileId});

  // If the user doesn't exist throw 404 not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist.');
  }

  // If the user profile's id doesn't match the current user's throw 403 forbidden error
  if (user._id.toString() !== userId) {
    throw new UnauthorizedError('You are not authorized to modify this profile')
  } 

  // Validates user input.
  const {value, error} = profileRevisionSchema.validate(req.body); 
  
  // If input validation fails throw 400 bad request error.
  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message);
  }  
  const base64Uri = value.profileImage;  
  const imageData = await uploadImage(base64Uri, 'profiles');

  value.profileImage = {
    url: imageData.secure_url,
    publicId: imageData.public_id 
  }; 

  // Delete previous profile image stored on cloudinary.
  if (user.profileImage.publicId !== '321') {
    deleteImage(user.profileImage.publicId);
  }

  user.set(value);
  await user.save({new: true, runValidators: true});

  res.status(200).json({message: 'Profile has been edited'});
};

const deleteProfile = async (req, res) => {
  const { userId } = req.user;  
  const { profileId } = req.params;

  const user = await User.findOne({_id: profileId});

  if (!user) {
    throw new NotFoundError('This user does not exist.');
  }

  // If the user profile's id doesn't match the current user's throw 403 forbidden error
  if (user._id.toString() !== userId) {
    throw new UnauthorizedError('You are not authorized to modify this profile')
  }

  // Delete previous profile image stored on cloudinary.
  if (user.profileImage.publicId !== '321') {
    deleteImage(user.profileImage.publicId);
  }
  
  await User.updateMany({},{$pull: {followers: user.id_}});
  await User.updateMany({},{$pull: {followedCooks: user._id}});
  await User.findOneAndDelete({_id: profileId});

  res.status(200).json({message: 'Profile has been deleted'});
};
 
const getProfileRecipes = async (req, res) => { 
  const { profileId } = req.params;
 
  /* Instructions on how to populate various fields and even nested fields inside of document. */
  const populateOptions = {
    path: 'recipes',
    populate: {
      path: 'createdBy',
      select: 'username profileImage _id'
    } 
  };

  const user = await User.findOne({_id: profileId}).populate(populateOptions);
  
  if (!user) {
    throw new NotFoundError('This User does not exist');
  }

  if (user.recipes.length < 1) {
    return res.status(200).json({message: "This user has no recipes"}); 
  }
  
  const recipeTiles = user.recipes.map(recipe => {
    return {
      recipeTitle: recipe.recipeTitle, 
      createdBy: recipe.createdBy._id,
      author: recipe.createdBy.username,
      authorImage: recipe.createdBy.profileImage.url,
      recipeId: recipe._id
    }
  }); 
  
  res.status(200).json({recipeTiles});
};

const getFavoriteRecipes = async (req, res) => {
  const { profileId } = req.params;
 
  /* Instructions on how to populate various fields and even nested fields inside of document. */
  const populateOptions = {
    path: 'favoriteRecipes',
    populate: {
      path: 'createdBy',
      select: 'username profileImage _id'
    } 
  };

  const user = await User.findOne({_id: profileId}).populate(populateOptions);

  if (!user) {
    throw new NotFoundError('This User does not exist');
  }

  if (user.favoriteRecipes.length < 1) {
    return res.status(200).json({message: "This user has no favorite recipes"}); 
  }
  
  const recipeTiles = user.favoriteRecipes.map(recipe => {
    return {
      recipeTitle: recipe.recipeTitle, 
      createdBy: recipe.createdBy._id,
      author: recipe.createdBy.username,
      authorImage: recipe.createdBy.profileImage.url,
      recipeId: recipe._id
    }
  }); 
  
  res.status(200).json({recipeTiles});
};

const getProfileComments = async (req, res) => {
  const { profileId } = req.params;
 
  /* Instructions on how to populate various fields and even nested fields inside of document. */
  const populateOptions = {
    path: 'comments',
    select: 'text madeBy parentPost',
    populate: {
      path: 'madeBy',
      select: 'username profileImage _id' 
    }
  };

  const user = await User.findOne({_id: profileId}).populate(populateOptions);

  if (!user) {
    throw new NotFoundError('This User does not exist');
  }

  /* Populating and modifying document in such a way to get an array of comments with only the required fields. */  
  const comments = user.comments.map(comment => {
    return {
      text: comment.text,
      commentId: comment._id,
      parentPost: comment.parentPost,
      userInfo: {
        id: comment.madeBy._id,
        username: comment.madeBy.username,
        profileImage: comment.madeBy.profileImage.url
      }
    };
  });
  
  if (comments.length < 1) { 
    return res.status(200).json({message: 'This user has no comments'});
  }

  res.status(200).json({comments});
}

const getFollowers = async (req, res) => { 
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
      profileImage: follower.profileImage.url,
      id: follower._id
    };
  });

  if (followers.length < 1) {
    return res.status(200).json({message: 'This user has no followers'});
  } 

  res.status(200).json({followers});
}

const getFollowing = async (req, res) => { 
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
      profileImage: cook.profileImage.url,
      id: cook._id
    };
  });

  if (followedCooks.length < 1) {
    return res.status(200).json({message: "This user isn't following anyone"});
  } 
  
  res.status(200).json({followedCooks});
};

const followUser = async (req, res) => { 
  const { userId } = req.user;
  const { profileId } = req.params;

  const user = await User.findOne({_id: profileId});

  // If user doesn't exist throw not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist');
  } 

  // If profile belongs to current user throw forbidden error.
  if (user._id.toString() === userId) { 
    throw new UnauthorizedError("You can't follow yourself!");
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
  const { userId } = req.user;
  const { profileId } = req.params;

  const user = await User.findOne({_id: profileId});

  // If user doesn't exist throw not found error.
  if (!user) {
    throw new NotFoundError('This user does not exist');
  } 

  // If profile belongs to current user throw forbidden error.
  if (user._id.toString() === userId) { 
    throw new UnauthorizedError("You can't unfollow yourself!");
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
  getProfileRecipes,
  getFavoriteRecipes,
  getProfileComments,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser 
};
