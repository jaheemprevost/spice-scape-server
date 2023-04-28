require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/connect');
const authenticationMiddleware = require('./middleware/authentication');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Api routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const recipeRoutes = require('./routes/recipe');
const commentRoutes = require('./routes/comment');

// Security packages 
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');

const app = express();

app.set('trust proxy', 1); 

// Enabling use of security packages
app.use(helmet());
app.use(xss())
app.use(cors());

// Parses JSON, form data, and cookies into request object
app.use(express.json({limit: '20MB'}));
app.use(express.urlencoded({extended : true, limit: '20MB'}));
app.use(cookieParser());

// routes

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', authenticationMiddleware, profileRoutes);
app.use('/api/v1/recipes', authenticationMiddleware,recipeRoutes);
app.use('/api/v1/comments', authenticationMiddleware, commentRoutes);

// Middleware

app.use(errorHandlerMiddleware);

// Establishes connection with mongo and runs server on designated port. 
const start = () => {
  try {
    connectDB(process.env.MONGO_URI);
    app.listen(3000, console.log('Server is up and running on port 3000...'));
  } catch(err) {
    console.log(err);
  }
};

start();
