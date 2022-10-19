const routerUser = require('express').Router();
const { getUser, editUserData } = require('../controllers/users');
const { validateEditUser } = require('../middlewares/validations');

routerUser.get('/me', getUser);
routerUser.patch('/me', validateEditUser, editUserData);

module.exports = { routerUser };
