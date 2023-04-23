require('dotenv').config();
require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
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

app.set('trust proxy', '127.0.0.1'); 

// Enabling use of security packages
app.use(helmet());
app.use(xss())
app.use(cors());

// Allows for JSON and form data to be parsed into the body of incoming requests

app.use(express.json());
app.use(express.urlencoded({extended : false}));

// routes

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/comments', commentRoutes);

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
