const rateLimit = require('express-rate-limit');
const ErrorRequestLimiter = require('../error-classes/ErrorRequestLimiter');


const apiRequestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  handler: (req, res, next) => next(new ErrorRequestLimiter('Превышено колличество запросов с вашего IP')),
});

module.exports = apiRequestLimiter;
