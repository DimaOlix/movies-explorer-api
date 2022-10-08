// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const {
  NODE_ENV,
  JWT_SECRET,
} = process.env;

const jwt = require('jsonwebtoken');
const ErrorAuthentication = require('../error-classes/ErrorAuthentication');
const ErrorServer = require('../error-classes/ErrorServer');


module.exports.checkAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      next(new ErrorAuthentication('Отсутствует токен'));
      return;
    }

    const payload = jwt.verify(token, (NODE_ENV === 'production')
      ? JWT_SECRET
      : 'secret');

    req.user = payload;
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new ErrorAuthentication('Некорректный токен'));
      return;
    }

    next(new ErrorServer(err));
  }

  next();
};
