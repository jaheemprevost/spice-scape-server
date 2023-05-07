const Joi = require('joi');

// Joi Schemas used to validate user input. 

// Validation for when creating a user profile.
const userCreationSchema = Joi.object({
  username: Joi.string().regex(/^[a-zA-Z0-9]+$/).min(6).max(16).required().trim().messages({
    'string.pattern.base': 'Only alphanumeric characters are allowed.',
    'string.empty': 'Please enter a username',
    'string.min': 'Username should have at least 6 characters',
    'string.max': 'Username should have at most 16 characters',
    'any.required': 'Username is required'
  }),
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Please enter a valid email',
    'string.empty': 'Please enter an email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().regex(/^[a-zA-Z0-9]+$/).min(8).max(16).required().trim().messages({
    'string.pattern.base': 'Only alphanumeric characters are allowed.',
    'string.empty': 'Please enter a password',
    'string.min': 'Password should have at least 8 characters',
    'string.max': 'Password should have at most 16 characters',
    'any.required': 'Password is required'
  })
}).options({ abortEarly: false });;

// Validation for when logging in a user.
const userLoginSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Please enter a valid email',
    'string.empty': 'Please enter an email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().regex(/^[a-zA-Z0-9]+$/).min(8).max(16).required().trim().message({
    'string.pattern.base': 'Only alphanumeric characters are allowed.',
    'string.empty': 'Please enter a password',
    'string.min': 'Password should have at least 8 characters',
    'string.max': 'Password should have at most 16 characters',
    'any.required': 'Password is required'
  })
});

// Validation for when editing a user profile.
const profileRevisionSchema = Joi.object({ 
  username: Joi.string().regex(/^[a-zA-Z0-9]+$/).min(6).max(16).required().trim().messages({
    'string.pattern.base': 'Only alphanumeric characters are allowed.',
    'string.empty': 'Please enter a username',
    'string.min': 'Username should have at least 6 characters',
    'string.max': 'Username id should have at most 16 characters',
    'any.required': 'Username is required'
  }),
  biography: Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(49).max(250).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please enter a description for your recipe',
    'string.min': 'Recipe description should have at least 49 characters',
    'string.max': 'Recipe description should have at most 250 characters',
    'any.required': 'A bio for your profile is required'
  }),
  profileImage: Joi.string().dataUri().required().messages({
    'string.empty': 'Please provide a valid data Uri',
    'any.required': 'An image for yor user profile is required'
  })
});

// Validation when creating a new recipe.
const recipeCreationSchema = Joi.object({
  createdBy: Joi.string().regex(/^[a-zA-Z0-9]+$/).min(24).max(24).required().trim().messages({
    'string.pattern.base': 'Only alphanumeric characters are allowed.',
    'string.empty': 'Please provide a createdBy id for your recipe',
    'string.min': 'createdBy id should have at least 24 characters',
    'string.max': 'createdBy id should have at most 24 characters',
    'any.required': 'createdBy id is required'
  }),
  recipeTitle:Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(3).max(211).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please enter a title for your recipe',
    'string.min': 'Recipe title should have at least 3 characters',
    'string.max': 'Recipe title should have at most 211 characters',
    'any.required': 'A title for your recipe is required'
  }),
  recipeDescription: Joi.string().regex(/^[a-zA-Z0-9 \-,'".!?:;\(\)]+$/).min(100).max(800).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please enter a description for your recipe',
    'string.min': 'Recipe description should have at least 100 characters',
    'string.max': 'Recipe description should have at most 800 characters',
    'any.required': 'A description for your recipe is required'
  }),
  recipeIngredients: Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(100).max(800).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please provide the ingredients for your recipe',
    'string.min': 'Recipe ingredients should have at least 100 characters',
    'string.max': 'Recipe ingredients should have at most 800 characters',
    'any.required': 'Ingredients for your recipe are required'
  }),
  recipeSteps: Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(100).max(800).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please provide steps for your recipe',
    'string.min': 'Recipe steps should have at least 100 characters',
    'string.max': 'Recipe steps should have at most 800 characters',
    'any.required': 'Steps for your recipe are required'
  }),
  recipeImage: Joi.string().dataUri().messages({
    'string.empty': 'Please provide a base64-encoded string'
  })
});

// Validation for when editing a recipe.
const recipeRevisionSchema = Joi.object({
  recipeTitle:Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(3).max(211).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please enter a title for your recipe',
    'string.min': 'Recipe title should have at least 3 characters',
    'string.max': 'Recipe title should have at most 211 characters',
    'any.required': 'A title for your recipe is required'
  }),
  recipeDescription: Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(100).max(800).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please enter a description for your recipe',
    'string.min': 'Recipe description should have at least 100 characters',
    'string.max': 'Recipe description should have at most 800 characters',
    'any.required': 'A description for your recipe is required'
  }),
  recipeIngredients: Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(100).max(800).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please provide the ingredients for your recipe',
    'string.min': 'Recipe ingredients should have at least 100 characters',
    'string.max': 'Recipe ingredients should have at most 800 characters',
    'any.required': 'Ingredients for your recipe are required'
  }),
  recipeSteps: Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(100).max(800).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please provide steps for your recipe',
    'string.min': 'Recipe steps should have at least 100 characters',
    'string.max': 'Recipe steps should have at most 800 characters',
    'any.required': 'Steps for your recipe are required'
  }),
  recipeImage: Joi.string().dataUri().required().messages({
    'string.empty': 'Please provide a valid data Uri',
    'any.required': 'An image for yor recipe is required'
  })
});

// Validation for when creating a new comment.
const commentCreationSchema = Joi.object({
  parentPost: Joi.string().regex(/^[a-zA-Z0-9]+$/).min(24).max(24).required().trim().messages({
    'string.pattern.base': 'Only alphanumeric characters are allowed.',
    'string.empty': 'Please provide a parentPost id for your comment',
    'string.min': 'parentPost id should have at least 24 characters',
    'string.max': 'parentPost id should have at most 24 characters',
    'any.required': 'parentPost id is required'
  }),
  madeBy: Joi.string().regex(/^[a-zA-Z0-9]+$/).min(24).max(24).required().trim().messages({
    'string.pattern.base': 'Only alphanumeric characters are allowed.',
    'string.empty': 'Please provide a madeBy id for your comment',
    'string.min': 'madeBy id should have at least 24 characters',
    'string.max': 'madeBy id should have at most 24 characters',
    'any.required': 'madeBy id is required'
  }),
  text: Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(3).max(150).required().trim().messages({
    'string.pattern.base': 'Special characters are not allowed.',
    'string.empty': 'Please provide text for your comment',
    'string.min': 'Comment should have at least 3 characters',
    'string.max': 'Comment should have at most 150 characters',
    'any.required': 'Text for your comment is required'
  })
});

// Validation for when editing a comment.
const commentRevisionValidator = Joi.string().regex(/^[a-zA-Z0-9 \-,.!?'":;\(\)]+$/).min(3).max(150).required().trim().messages({
  'string.pattern.base': 'Special characters are not allowed.',
  'string.empty': 'Please provide text for your comment',
  'string.min': 'Comment should have at least 3 characters',
  'string.max': 'Comment should have at most 150 characters',
  'any.required': 'Text for your comment is required'
});

module.exports = {
  userCreationSchema,
  userLoginSchema,
  profileRevisionSchema,
  recipeCreationSchema,
  recipeRevisionSchema,
  commentCreationSchema,
  commentRevisionValidator
};
