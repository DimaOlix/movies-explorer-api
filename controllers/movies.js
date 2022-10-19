const ErrorForbidden = require('../error-classes/ErrorForbidden');
const ErrorIncorrectData = require('../error-classes/ErrorIncorrectData');
const ErrorNotFound = require('../error-classes/ErrorNotFound');
const ErrorServer = require('../error-classes/ErrorServer');
const Muvie = require('../models/movies');
const {
  messageNotFoundMovies,
  messageErrorServer,
  messageIncorrectData,
  messageForidden,
} = require('../utils/errorMessage');

module.exports.getUserMovies = async (req, res, next) => {
  try {
    const movies = await Muvie.find({ owner: req.user._id });

    res.send(movies);
  } catch (err) {
    next(new ErrorServer(messageErrorServer));
  }
};

module.exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Muvie.create({ ...req.body, owner: req.user._id });

    res.send(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData(messageIncorrectData));
      return;
    }

    next(new ErrorServer(messageErrorServer));
  }
};

module.exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Muvie.findById(req.params.movieId);

    if (!movie) {
      next(new ErrorNotFound(messageNotFoundMovies));
      return;
    }

    if (JSON.stringify(movie.owner) !== JSON.stringify(req.user._id)) {
      next(new ErrorForbidden(messageForidden));
      return;
    }

    await Muvie.deleteOne(movie);

    res.send(movie);
  } catch (err) {
    next(new ErrorServer(messageErrorServer));
  }
};
