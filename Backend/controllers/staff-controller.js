const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/staff');

// === Signup Controller ===
const signup = async (req, res, next) => {
  // Validate request input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { username, email, password } = req.body;

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new HttpError('User exists already, please login instead.', 422)
      );
    }
  } catch (err) {
    return next(new HttpError('Creating user failed, please try again.', 500));
  }

  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not create user, please try again.', 500));
  }

  // Create new user instance
  const createdUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  // Save to DB
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Saving user failed, please try again.', 500));
  }

  // Generate JWT token
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      `${process.env.JWT_KEY}`,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(
      new HttpError('Signing up token failed, please try again.', 500)
    );
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    username: createdUser.username,
    token,
  });
};

// === Login Controller ===
const login = async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { email, password } = req.body;

  // Find user by email
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new HttpError('Invalid email, could not log you in.', 401));
    }
  } catch (err) {
    return next(new HttpError('Login failed, please try again.', 500));
  }

  // Compare password
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return next(
        new HttpError('Invalid password, could not log you in.', 401)
      );
    }
  } catch (err) {
    return next(new HttpError('Password verification failed.', 500));
  }

  // Generate JWT token
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      `${process.env.JWT_KEY}`,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(
      new HttpError('Logging in token failed, please try again.', 500)
    );
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
    token,
  });
};

exports.signup = signup;
exports.login = login;
