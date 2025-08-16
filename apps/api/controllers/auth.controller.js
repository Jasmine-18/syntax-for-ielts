const User = require ('../models/user.model');
const jwt = require ('jsonwebtoken');

// Handle errors
const handleErrors = err => {
  console.log (err.message, err.code);
  let message = 'An error occurred'; // Default error message

  // Duplicate email error
  if (err.code === 11000) {
    message = 'That email is already registered';
    return {message};
  }

  // Validation errors - we'll take the first one that appears
  if (err.message.includes ('user validation failed')) {
    // Grab the first validation error message
    const firstError = Object.values (err.errors)[0];
    message = firstError.properties.message;
  }

  // Incorrect email
  if (err.message === 'incorrect email') {
    message = 'The email you entered is not registered';
  }

  // Incorrect password
  if (err.message === 'incorrect password') {
    message = 'The password you entered is not correct';
  }

  return {message};
};

// Create json web token
const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
const createToken = id => {
  return jwt.sign ({id}, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.signup_post = async (req, res) => {
  const {name, email, password} = req.body;

  try {
    const user = await User.create ({name, email, password});
    const token = createToken (user._id);
    res.cookie ('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status (201).json ({
      message: 'Sign up successfully',
      user: {id: user._id, email: user.email},
    });
  } catch (err) {
    const error = handleErrors (err);
    res.status (400).json (error);
  }
};

module.exports.login_post = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.login (email, password);
    const token = createToken (user._id);
    res.cookie ('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status (200).json ({
      message: 'User logged in successfully',
      user: {id: user._id, email: user.email},
    });
  } catch (err) {
    const error = handleErrors (err);
    res.status (400).json (error);
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie ('jwt', '', {maxAge: 1});
  // Instead of redirecting, it's common for APIs to just send a success message.
  res.status (200).json ({message: 'User logged out successfully'});
};
