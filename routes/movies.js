const routerMovie = require('express').Router();


const { getUserMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { validateCreateMovie, validateMovieId } = require('../middlewares/validations');

routerMovie.get('/', getUserMovies);
routerMovie.post('/', validateCreateMovie, createMovie);
routerMovie.delete('/:movieId', validateMovieId, deleteMovie);

module.exports = { routerMovie };
