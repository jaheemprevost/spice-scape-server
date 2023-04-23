const {BadRequestError, NotFoundError, UnauthenticatedError} = require('../errors');
const {recipeCreationSchema, recipeRevisionSchema, commentCreationSchema, commentRevisionValidator} = require('../utils/joi');
const Recipe = require('../models/recipe');
const Comment = require('../models/comment');
const User = require('../models/user');

// Retrieves all recipes from database and serves them to frontend.
const getRecipes = async (req, res) => {
  const recipes = await Recipe.find({});

  if (recipes.length < 1) {
    return res.status(200).json({message: "There aren't any recipes. Be the first to post one!"}); 
  }

  res.status(200).json({message: 'Success', recipes});
}; 

// Retrieves a single recipe based on extracted id parameter.
const getRecipe = async (req, res) => {
  const {recipeId} = req.params;

  const recipe = await Recipe.findOne({_id: recipeId});
  
  // If recipe does not exist throw not found error.
  if (!recipe) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  }

  res.status(200).json({message: 'Success', recipe});
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
      comment: comment.text,
      commentId: comment._id,
      userInfo: {
        id: comment.madeBy._id,
        username: comment.madeBy.username,
        profileImage: comment.madeBy.profileImage
      }
    };
  });
  
  if (comments.length < 1) {
    console.log(comments)
    return res.status(200).json({message: 'This recipe has no comments'});
  }

  res.status(200).json({message: 'Success', comments});
}

// Validates user input data and creates document in database. 
const createRecipe = async (req, res) => {
  // Hardcoded user id to test controllers before authentication is implemented
  // req.user = {userId: 'userIdForTesting'};
  // const {userId} = req.user;
  // req.body.createdBy = userId;

  // Validates user input.
  const {value, error} = recipeCreationSchema.validate(req.body);
 
  // If input validation fails throw 400 bad request error.
  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message);
  }

  const recipe = await Recipe.create(value);

  // Add reference id of recipe from user's list of created recipes.
  await User.updateOne({_id: userId}, {$push: { recipes: recipe._id }});

  res.status(201).json({message: 'Success', recipe});
}

const createComment = async (req, res) => { 
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 

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
  res.status(200).json({message: 'Success', comment});
};

const editRecipeData = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
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

    // Validates user input
    const {value, error} = recipeRevisionSchema.validate(req.body);

    //If input validation fails throw 400 bad request error.
    if (error) {
      const message = error.details[0].message;
      throw new BadRequestError(message); 
    }

    // If recipe wasn't created by current user throw 401 unauthorized error.
    if (recipe.createdBy.toString() !== userId) { 
      throw new UnauthenticatedError('You are not authorized to modify this recipe');
    }

    // Update only the specific values provided by the user. 
    recipe.set(value);
    await recipe.save({new: true, runValidators: true});
    return res.status(200).json({message: 'Success', recipe});
  } 

  // Else edit the specified comment.
  const comment = await Comment.findOne({_id: commentId});

  // If comment doesn't exist throw 404 not found error.
  if (!comment) {
    throw new NotFoundError('This comment does not exist');
  }

  if (comment.madeBy.toString() !== userId){
    throw new UnauthenticatedError('You are not authorized to modify this comment');
  } 

  const {value, error} = commentRevisionValidator.validate(req.body.text);

  // If input validation fails throw 400 bad request error.
  if (error) {
    const message = error.details[0].message;
    throw new BadRequestError(message); 
  }

  comment.set({text: value});
  const result = await comment.save({new: true, runValidators: true});
  console.log(result);
  res.status(200).json({message: 'Success', comment});
};


const deleteRecipeData = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
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

    // If recipe wasn't created by current user throw 401 unauthorized error.
    if (recipe.createdBy.toString() !== userId) { 
      throw new UnauthenticatedError('You are not authorized to modify this recipe');
    }

    await Recipe.findOneAndDelete({_id: recipeId});

    // Remove reference id of recipe from user's list of created recipes.
    await User.updateOne({_id: userId}, {$pull: { recipes: recipeId }});

    return res.status(200).json({message: 'Success', recipe});
  } 

  // Else delete the specified comment. 
  const comment = await Comment.findOne({_id: commentId}); 

  // If comment doesn't exist throw 404 not found error.
  if (!comment) {
    throw new NotFoundError('This comment does not exist');
  }

  // If comment wasn't created by current user throw 401 unauthorized error.
  if (comment.madeBy.toString() !== userId){
    throw new UnauthenticatedError('You are not authorized to modify this comment');
  }   

  await Comment.findOneAndDelete({_id: commentId});

  // Remove reference id of comment from user's list of created recipes.
  await Recipe.updateOne({_id: recipeId}, {$pull: { comments: commentId }});

  // Remove reference id of comment from user's list of created comments.
  await User.updateOne({_id: userId}, {$pull: { comments: commentId }}); 
  
  res.status(200).json({message: 'Success', comment}); 
};

const favoriteRecipe = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
  const { recipeId } = req.params;

  const recipe = await Recipe.findOne({_id: recipeId});

  // If recipe doesn't exist throw 404 not found error.
  if (!recipe) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  } 

  // If recipe was created by current user throw unauthorized error.
  if (recipe.createdBy.toString() === userId) { 
    throw new UnauthenticatedError("You can't favorite your own recipes!");
  }

  const user = await User.findOne({_id: userId});
  
  // If recipe is already in current user's favorite list throw bad request error.
  if (user.favoriteRecipes.includes(recipeId)) {
    throw new BadRequestError("You've already favorited this recipe!");
  }

  await User.updateOne({_id: userId}, {$push: { favoriteRecipes: recipeId }});

  res.status(200).json({message: 'Success'});
}

const unfavoriteRecipe = async (req, res) => {
  // req.user = {userId: 'userIdForTesting'}; 
  // const {userId} = req.user; 
  const { recipeId } = req.params;

  const recipe = await Recipe.findOne({_id: recipeId});

  // If recipe doesn't exist throw 404 not found error.
  if (!recipe) {
    throw new NotFoundError('The recipe you are looking for does not exist.');
  } 

  // If recipe was created by current user throw unauthorized error.
  if (recipe.createdBy.toString() === userId) { 
    throw new UnauthenticatedError("You can't unfavorite your own recipes!");
  }

  const user = await User.findOne({_id: userId});
  
  // If recipe is not present in current user's favorite list throw bad request error.
  if (!user.favoriteRecipes.includes(recipeId)) {
    throw new BadRequestError("This recipe is not present in your favorite recipes list.");
  }

  await User.updateOne({_id: userId}, {$pull: { favoriteRecipes: recipeId }});

  res.status(200).json({message: 'Success'});
};

module.exports = {
  getRecipes, 
  getRecipe,
  getRecipeComments, 
  createRecipe,
  createComment,
  editRecipeData,
  deleteRecipeData,
  favoriteRecipe,
  unfavoriteRecipe
};
