// config/db.js
const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 * The function uses the MONGODB_URI from the environment variables.
 * If the connection fails, it logs the error and exits the process.
 */
const connectDB = async () => {
  try {
    // In Mongoose 6 and higher, the connection options like useNewUrlParser 
    // and useUnifiedTopology are no longer needed as they are the default.
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;