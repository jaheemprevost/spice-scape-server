require('dotenv').config();
require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
const authenticationMiddleware = require('./middleware/authentication');
const errorHandlerMiddleware = require('./middleware/error-handler');
const PORT = process.env.PORT || 3000;

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


// Whitelisted domains
const allowedDomains = ['http://localhost:5173', 'https://spice-scape.netlify.app'];
// Enabling use of security packages
app.use(helmet());
app.use(xss());

app.use(cors({
  origin: allowedDomains,
  credentials: true
}));

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
    app.listen(PORT, console.log('Server is up and running...'));
  } catch(err) {
    console.log(err);
  }
};

start();
