const ErrorForbidden = require('../error-classes/ErrorForbidden');
const ErrorIncorrectData = require('../error-classes/ErrorIncorrectData');
const ErrorNotFound = require('../error-classes/ErrorNotFound');
const ErrorServer = require('../error-classes/ErrorServer');
const Muvie = require('../models/movies');

module.exports.getUserMovies = async (req, res, next) => {
  try {
    const movies = await Muvie.find({ owner: req.user._id });

    if (movies.length === 0) {
      next(new ErrorNotFound('У вас пока нет добавленных видео :('));
    }

    res.send(movies);
  } catch (err) {
    next(new ErrorServer('Произошла ошибка на сервере'));
  }
};

module.exports.createMovie = async (req, res, next) => {
  try {
    const {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRu,
      nameEn,
      thumbnail,
      movieId,
    } = req.body;

    const owner = req.user._id;

    const movie = await Muvie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRu,
      nameEn,
      thumbnail,
      movieId,
      owner,
    });

    res.send(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData('Переданные данные не прошли проверку'));
      return;
    }

    next(new ErrorServer('Произошла ошибка на сервере'));
  }
};

module.exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Muvie.findById(req.params.movieId);

    if (!movie) {
      next(new ErrorForbidden('Фильм с данным id не найден'));
      return;
    }

    await Muvie.deleteOne(movie);

    res.send(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData('Переданы некорректные данные'));
      return;
    }

    next(new ErrorServer('Произошла ошибка на сервере'));
  }
};
