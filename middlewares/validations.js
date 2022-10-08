const { celebrate, Joi } = require('celebrate');
const regularExpressionForUrl = require('../utils/regularExpressionForUrl');
// eslint-disable-next-line import/order
const { ObjectId } = require('mongoose').Types;

const validateLink = (value, helpers) => {
  // eslint-disable-next-line no-useless-escape
  if (!regularExpressionForUrl.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const validateId = (value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

module.exports.validateCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

module.exports.validateEditUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
});

module.exports.validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

module.exports.validateCreateMovie = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required().min(2).max(30),
    director: Joi.string().required().min(2).max(30),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(validateLink, 'custom validation'),
    trailerLink: Joi.string().required().custom(validateLink, 'custom validation'),
    thumbnail: Joi.string().required().custom(validateLink, 'custom validation'),
    nameRu: Joi.string().required().min(2).max(30),
    nameEn: Joi.string().required().min(2).max(30),
    movieId: Joi.string().required().custom(validateId),
  }),
});

module.exports.validateMovieId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().custom((value, helpers) => {
      if (!ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
  }),
});
