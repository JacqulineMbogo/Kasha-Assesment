// middleware to authenticate user
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require('../models/staff');

const checkAuth = async (req, res, next) => {
  //OPTIONS request is sent by the browser to check if the server accepts the request
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new HttpError('Authentication failed', 401));
  }

  const token = authHeader.split(' ')[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    console.error('JWT Verification Error:', err.message); 
    return next(new HttpError('Authentication failed', 401));
  }

  if (!decodedToken) {
    return next(new HttpError('Authentication failed', 401));
  }

  req.userData = { userId: decodedToken.userId };
  next();
};

module.exports = checkAuth;
