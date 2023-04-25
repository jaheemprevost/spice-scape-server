const mongoose = require('mongoose');
  
const recipeSchema = mongoose.Schema({
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user Id']
  },
  recipeTitle: {
    type: String,
    minLength: 3,
    maxLength: 211,
    required: [true, 'Please provide the name of your recipe']
  },
  recipeDescription: {
    type: String, 
    minLength: 100,
    maxLength: 800,
    required: [true, 'Please provide a description for your recipe']
  },
  recipeIngredients: {
    type: String,
    minLength: 100,
    maxLength: 800,
    required: [true,'Please provide the ingredients for your recipe']
  },
  recipeSteps: {
    type: String,
    minLength: 100,
    maxLength: 800,
    required: [true, 'Please provide the steps for the recipe']
  },
  recipeImage: {
    publicId: {
      type: 'String',
      default: '123',
      required: true
    },
    url: {
      type: 'String',
      default: 'https://res.cloudinary.com/dhscoasnw/image/upload/v1682023030/default-dish_ciooaz.png',
      required: true
    }
  },
  comments: [{type: mongoose.Types.ObjectId, ref: 'Comment'}]
});

module.exports = mongoose.model('Recipe', recipeSchema);
