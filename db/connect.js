const mongoose = require('mongoose');

// Connects to the Mongo database associated with the given URI string.
const connectDB = async (connectionString) => {
  await mongoose.connect(connectionString);
};

module.exports = connectDB;
