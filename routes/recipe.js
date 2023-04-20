const express = require('express');
const router = express.Router();

const {
  getRecipes, 
  getRecipe,
  createRecipe,
  editRecipe,
  deleteRecipe,
  favoriteRecipe,
  unfavoriteRecipe
} = require('../controllers/recipe');

router.route('/').get(getRecipes).post(createRecipe);
router.route('/:id').get(getRecipe).patch(editRecipe).delete(deleteRecipe);
router.route('/:id/favorite').post(favoriteRecipe).delete(unfavoriteRecipe);

module.exports = router;
