const getRecipes = async (req, res) => {
  res.send('Get all recipes(Normal Home Feed).');
};

const getRecipe = async (req, res) => {
  res.send('Get single recipe (individual post).');
};

const createRecipe = async (req, res) => {
  res.send('Create Recipe here');
}

const editRecipe = async (req, res) => {
  res.send('Edit recipe here.');
};

const deleteRecipe = async (req, res) => {
  res.send('Delete recipe here.');
};

const favoriteRecipe = async (req, res) => {
  res.send('Favorite recipe here.');
}

const unfavoriteRecipe = async (req, res) => {
  res.send('Unfavorite recipe here.');
};

module.exports = {
  getRecipes,
  getRecipe,
  createRecipe,
  editRecipe,
  deleteRecipe,
  favoriteRecipe,
  unfavoriteRecipe
};
