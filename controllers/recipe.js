const { BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const {recipeCreationSchema, recipeRevisionSchema, commentCreationSchema, commentRevisionValidator} = require('../utils/joi');
const Recipe = require('../models/recipe');
const Comment = require('../models/comment');
const User = require('../models/user');

// Retrieves all recipes from database and serves them to frontend.
const getRecipes = async (req, res) => {

  /* Instructions on how to populate various fields and even nested fields inside of document. */
  const populateOptions = {
    path: 'createdBy',
    select: 'username profileImage _id' 
  };

  const recipes = await Recipe.find({}).populate(populateOptions);

  if (recipes.length < 1) {
    return res.status(200).json({message: "There aren't any recipes. Be the first to post one!"}); 
  }

  const recipeTiles = recipes.map(recipe => {
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

// Retrieves a single recipe based on extracted id parameter.
const getRecipe = async (req, res) => {
  const { userId } = req.user;
  const {recipeId} = req.params;

  const populateOptions = {
    path: 'createdBy',
    select: 'username _id' 
  };

  const recipe = await Recipe.findOne({_id: recipeId}).populate(populateOptions);
  
  // If recipe does not exist throw not found error.
  if (!recipe) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  }
  
  const user = await User.findOne({_id: userId});

  const isFavorite = user.favoriteRecipes.includes(recipeId);
  const isOwnRecipe = user.recipes.includes(recipeId); 
  
  res.status(200).json({recipe, isFavorite, isOwnRecipe});
}; 

const getRecipeComments = async (req, res) => {
  const {recipeId} = req.params;

  /* Instructions on how to populate various fields and even nested fields inside of document. */
  const populateOptions = {
    path: 'comments',
    select: 'text madeBy',
    populate: {
      path: 'madeBy',
      select: 'username profileImage _id' 
    }
  };

  const recipe = await Recipe.findOne({_id: recipeId}).populate(populateOptions);

  if (!recipe) {
    throw new NotFoundError('This Recipe does not exist');
  }

  /* Populating and modifying document in such a way to get an array of comments with only the required fields. */  
  const comments = recipe.comments.map(comment => {
    return {
      text: comment.text,
      commentId: comment._id,
      userInfo: {
        id: comment.madeBy._id,
        username: comment.madeBy.username,
        profileImage: comment.madeBy.profileImage.url
      }
    };
  });
  
  if (comments.length < 1) { 
    return res.status(200).json({message: 'This recipe has no comments'});
  }

  res.status(200).json({comments});
}

const getFollowingFeed = async (req, res) => {
  const { userId } = req.user;

  /* Instructions on how to populate various fields and even nested fields inside of document. */
  const populateOptions = {
    path: 'createdBy',
    select: 'username profileImage _id' 
  };

  const user = await User.findOne({_id: userId}).populate('followedCooks');
  
  if (!user) {
    throw new NotFoundError('This User does not exist');
  }
  
  const followedCooks = user.followedCooks.map(cook => cook._id);

  const recipes = await Recipe.find({ createdBy: { $in: followedCooks} }).populate(populateOptions); 

  if (recipes.length < 1) {
    return res.status(200).json({message: "There aren't any recipes."}); 
  }

  const recipeTiles = recipes.map(recipe => {
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

// Validates user input data and creates document in database. 
const createRecipe = async (req, res) => {
  const { userId } = req.user;
  req.body.createdBy = userId;
  
  // Validates user input.
  const {value, error} = recipeCreationSchema.validate(req.body);
 
  // If input validation fails throw 400 bad request error.
  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message);
  } 
  
  
  if (value.recipeImage) {
    const base64String = value.recipeImage;  
    const imageData = await uploadImage(base64String, 'recipes');

    value.recipeImage = {
      url: imageData.secure_url,
      publicId: imageData.public_id 
    };
  }

  const recipe = await Recipe.create(value);

  // Add reference id of recipe from user's list of created recipes.
  await User.updateOne({_id: userId}, {$push: { recipes: recipe._id }});

  res.status(201).json({message: 'Recipe successfully created'});
}

const createComment = async (req, res) => { 
  const { userId } = req.user;
  req.body.madeBy = userId;

  const {recipeId} = req.params;
  req.body.parentPost = recipeId;

  const recipe = Recipe.findOne({_id: recipeId});

  // If recipe doesn't exist throw 404 not found error.
  if (!recipe) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  }

  const {value, error} = commentCreationSchema.validate(req.body);

  // If input validation fails throw 400 bad request error.
  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message);
  }

  const comment = await Comment.create(value);
 
  await Recipe.findOneAndUpdate({_id: recipeId}, {$push: { comments: comment.id }});
  
  await User.findOneAndUpdate({_id: userId}, {$push: { comments: comment.id}});
  res.status(201).json({message: 'Comment successfully created'});
};

const editRecipeData = async (req, res) => {
  const { userId } = req.user; 
  const { recipeId, commentId } = req.query;

  // If recipeId is absent or if it's present as an empty string throw an error.
  if (!recipeId || recipeId && recipeId.length === 0) {
    throw new BadRequestError('Please provide Recipe Id');
  }

  // If commentId is present but is an empty string throw an error.
  if (commentId && commentId.length === 0) {
    throw new BadRequestError('Please provide Comment Id');
  }

  // if recipeId is present but commentId is absent edit Recipe
  if (recipeId && !commentId) {
    const recipe = await Recipe.findOne({_id: recipeId});
    
    // If recipe doesn't exist throw 404 not found error.
    if (!recipe) {
      throw new NotFoundError('The recipe you are looking for does not exist.');
    }  

    // If recipe wasn't created by current user throw 403 forbidden error.
    if (recipe.createdBy.toString() !== userId) { 
      throw new UnauthorizedError('You are not authorized to modify this recipe');
    }

    // Validates user input
    const {value, error} = recipeRevisionSchema.validate(req.body);

    // If input validation fails throw 400 bad request error.
    if (error) {
       const message = error.details[0].message;
       throw new BadRequestError(message); 
    }
    
    const base64Uri = value.recipeImage;  
    const imageData = await uploadImage(base64Uri, 'recipes');

    value.recipeImage = {
      url: imageData.secure_url,
      publicId: imageData.public_id 
    };
 
    // Delete previous recipe image stored on cloudinary if it isn't the default.
    if (recipe.recipeImage.publicId !== '123') {
      deleteImage(recipe.recipeImage.publicId);
    }

    // Update only the specific values provided by the user. 
    recipe.set(value);
    await recipe.save({new: true, runValidators: true});
    return res.status(200).json({message: 'Recipe successfully edited'});
  }  

  // Else edit the specified comment.
  const comment = await Comment.findOne({_id: commentId});

  // If comment doesn't exist throw 404 not found error.
  if (!comment) {
    throw new NotFoundError('This comment does not exist');
  }

  if (comment.madeBy.toString() !== userId){
    throw new UnauthorizedError('You are not authorized to modify this comment');
  } 

  const {value, error} = commentRevisionValidator.validate(req.body.text);

  // If input validation fails throw 400 bad request error.
  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message); 
  }

  comment.set({text: value});
  const result = await comment.save({new: true, runValidators: true});

  res.status(200).json({message: 'Comment successfully edited'});
};


const deleteRecipeData = async (req, res) => {
  const { userId } = req.user;
  const { recipeId, commentId } = req.query;

  // If recipeId is absent or if it's present as an empty string throw an error.
  if (!recipeId || recipeId && recipeId.length === 0) {
    throw new BadRequestError('Please provide Recipe Id');
  }

  // If commentId is present but is an empty string throw an error.
  if (commentId && commentId.length === 0) {
    throw new BadRequestError('Please provide Comment Id');
  }

  // if recipeId is present but commentId is absent delete Recipe
  if (recipeId && !commentId) {

    const recipe = await Recipe.findOne({_id: recipeId});

    // If recipe doesn't exist throw 404 not found error.
    if (!recipe) {
      throw new NotFoundError('The recipe you are looking for does not exist.');
    } 

    // If recipe wasn't created by current user throw 401 forbidden error.
    if (recipe.createdBy.toString() !== userId) { 
      throw new UnauthorizedError('You are not authorized to modify this recipe');
    }

    // Delete previous recipe image stored on cloudinary if it isn't the default.
    if (recipe.recipeImage.publicId !== '123') {
      deleteImage(recipe.recipeImage.publicId);
    }

    await Recipe.findOneAndDelete({_id: recipeId});

    // Remove reference id of recipe from user's list of created recipes.
    await User.updateOne({_id: userId}, {$pull: { recipes: recipeId }});

    return res.status(200).json({message: 'Recipe successfully deleted'});
  } 

  // Else delete the specified comment. 
  const comment = await Comment.findOne({_id: commentId}); 

  // If comment doesn't exist throw 404 not found error.
  if (!comment) {
    throw new NotFoundError('This comment does not exist');
  }

  // If comment wasn't created by current user throw 403 forbidden error.
  if (comment.madeBy.toString() !== userId){
    throw new UnauthorizedError('You are not authorized to modify this comment');
  }   

  await Comment.findOneAndDelete({_id: commentId});

  // Remove reference id of comment from user's list of created recipes.
  await Recipe.updateOne({_id: recipeId}, {$pull: { comments: commentId }});

  // Remove reference id of comment from user's list of created comments.
  await User.updateOne({_id: userId}, {$pull: { comments: commentId }}); 
  
  res.status(200).json({message: 'Comment successfully deleted'}); 
};

const favoriteRecipe = async (req, res) => {
  const { userId } = req.user;
  const { recipeId } = req.params;

  const recipe = await Recipe.findOne({_id: recipeId});

  // If recipe doesn't exist throw 404 not found error.
  if (!recipe) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  } 

  // If recipe was created by current user throw forbidden error.
  if (recipe.createdBy.toString() === userId) { 
    throw new UnauthorizedError("You can't favorite your own recipes!");
  }

  const user = await User.findOne({_id: userId});
  
  // If recipe is already in current user's favorite list throw bad request error.
  if (user.favoriteRecipes.includes(recipeId)) {
    throw new BadRequestError("You've already favorited this recipe!");
  }

  await User.updateOne({_id: userId}, {$push: { favoriteRecipes: recipeId }});

  res.status(200).json({message: 'Recipe favorited successfully'});
}

const unfavoriteRecipe = async (req, res) => {
  const { userId } = req.user;
  const { recipeId } = req.params;

  const recipe = await Recipe.findOne({_id: recipeId});

  // If recipe doesn't exist throw 404 not found error.
  if (!recipe) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  } 

  // If recipe was created by current user throw forbidden error.
  if (recipe.createdBy.toString() === userId) { 
    throw new UnauthorizedError("You can't unfavorite your own recipes!");
  }

  const user = await User.findOne({_id: userId});
  
  // If recipe is not present in current user's favorite list throw bad request error.
  if (!user.favoriteRecipes.includes(recipeId)) {
    throw new BadRequestError("This recipe is not present in your favorite recipes list.");
  }

  await User.updateOne({_id: userId}, {$pull: { favoriteRecipes: recipeId }});

  res.status(200).json({message: 'Recipe unfavorited successfully'});
};

module.exports = {
  getRecipes, 
  getRecipe,
  getRecipeComments,
  getFollowingFeed, 
  createRecipe,
  createComment,
  editRecipeData,
  deleteRecipeData,
  favoriteRecipe,
  unfavoriteRecipe
};
