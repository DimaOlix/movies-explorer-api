// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const {
  NODE_ENV,
  PORT,
  MONGO_URI,
} = process.env;

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const routerUser = require('./routes/users');
const routerMovie = require('./routes/movies');
const { checkAuth } = require('./middlewares/auth');
const { createUser, login, logOut } = require('./controllers/users');
const ErrorNonExistentAddress = require('./error-classes/ErrorNonExistentAddress');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { validateLogin, validateCreateUser } = require('./middlewares/validations');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateLogin, login);

app.use(checkAuth);

app.post('/signout', logOut);

app.use('/users', routerUser);
app.use('/movies', routerMovie);

app.use('*', (req, res, next) => {
  next(new ErrorNonExistentAddress('Неверный адрес запроса'));
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

async function connect() {
  await mongoose.connect(NODE_ENV === 'production'
    ? MONGO_URI
    : 'mongodb://localhost:27017/mestodb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });

  await app.listen(NODE_ENV === 'production' ? PORT : 3000);
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${NODE_ENV === 'production' ? PORT : 3000}`);
}

connect();
