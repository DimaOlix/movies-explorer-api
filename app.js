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
const helmet = require('helmet');
const apiRequestLimiter = require('./utils/apiRequestLimiter');
const { routerMovie, routerUser } = require('./routes/index');
const { checkAuth } = require('./middlewares/auth');
const { createUser, login, logOut } = require('./controllers/users');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { validateLogin, validateCreateUser } = require('./middlewares/validations');
const mongoAddress = require('./utils/mongoAddress');
const { messageNonExistentAddress } = require('./utils/errorMessage');
const ErrorNotFound = require('./error-classes/ErrorNotFound');


const app = express();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);

app.use(apiRequestLimiter);

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateLogin, login);

app.use(checkAuth);

app.post('/signout', logOut);

app.use('/users', routerUser);
app.use('/movies', routerMovie);

app.use('*', (req, res, next) => {
  next(new ErrorNotFound(messageNonExistentAddress));
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

async function connect() {
  await mongoose.connect(NODE_ENV === 'production'
    ? MONGO_URI
    : mongoAddress,
  {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });

  await app.listen(NODE_ENV === 'production' ? PORT : 3000);
  console.log(`App listening on port ${NODE_ENV === 'production' ? PORT : 3000}`);
}

connect();
