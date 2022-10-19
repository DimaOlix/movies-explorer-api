const rateLimit = require('express-rate-limit');
const ErrorRequestLimiter = require('../error-classes/ErrorRequestLimiter');
const { messageRequestLimiter } = require('./errorMessage');


const apiRequestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  handler: (req, res, next) => next(new ErrorRequestLimiter(messageRequestLimiter)),
});

module.exports = apiRequestLimiter;
