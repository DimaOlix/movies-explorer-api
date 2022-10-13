const routerMovie = require('express').Router();
const routerUser = require('express').Router();
const { getUserMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { validateCreateMovie, validateMovieId } = require('../middlewares/validations');
const { getUser, editUserData } = require('../controllers/users');
const { validateEditUser } = require('../middlewares/validations');

routerUser.get('/me', getUser);
routerUser.patch('/me', validateEditUser, editUserData);
routerMovie.get('/', getUserMovies);
routerMovie.post('/', validateCreateMovie, createMovie);
routerMovie.delete('/:movieId', validateMovieId, deleteMovie);

module.exports = { routerUser, routerMovie };
