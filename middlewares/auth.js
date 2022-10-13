require('dotenv').config();

const {
  NODE_ENV,
  JWT_SECRET,
} = process.env;

const jwt = require('jsonwebtoken');
const ErrorAuthentication = require('../error-classes/ErrorAuthentication');
const ErrorServer = require('../error-classes/ErrorServer');
const {
  messageNoToken,
  messageIncorrectToken,
} = require('../utils/errorMessage');


module.exports.checkAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      next(new ErrorAuthentication(messageNoToken));
      return;
    }

    const payload = jwt.verify(token, (NODE_ENV === 'production')
      ? JWT_SECRET
      : 'secret');

    req.user = payload;
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new ErrorAuthentication(messageIncorrectToken));
      return;
    }

    next(new ErrorServer(err));
  }

  next();
};
