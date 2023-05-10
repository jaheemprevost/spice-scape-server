const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/recipe');

router.route('/').get(getRecipes).post(createRecipe).patch(editRecipeData).delete(deleteRecipeData);
router.route('/following-feed').get(getFollowingFeed);
router.route('/:recipeId').get(getRecipe) ;
router.route('/:recipeId/comments').get(getRecipeComments).post(createComment);
router.route('/:recipeId/favorite').post(favoriteRecipe).delete(unfavoriteRecipe);

module.exports = router;
