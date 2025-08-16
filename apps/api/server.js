// server.js
const express = require ('express');
const cors = require ('cors');
require ('dotenv').config ();
const connectDB = require ('./config/db'); // 1. Import the database connection function
const authRoutes = require ('./routes/auth.route'); // Use the user-specified route path
const speakingRoutes = require ('./routes/speaking.route'); // Use the user-specified route path
const evaluateRoutes = require ('./routes/evaluation.route'); // Use the user-specified route path

const app = express ();

// 2. Connect to the database
// This function will handle connecting to MongoDB and log the status.
connectDB ();

// Middleware
app.use (cors ());
app.use (express.json ()); // Middleware to parse JSON request bodies

// Routes
// All routes defined in authRoutes will be available under the main path.
app.use ('/api/auth', authRoutes);
app.use ('/api/speaking', speakingRoutes);
app.use ('/api/evaluate', evaluateRoutes);
app.get ('/', 'Welcome to the IELTS Speaking API!');

// Define the port the server will listen on.
const PORT = process.env.PORT || 3000;

// 3. Start the server
// The server will now start listening for requests on the specified port.
app.listen (PORT, () => {
  console.log (`Server is running and listening on port ${PORT}`);
});
