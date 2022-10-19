require('dotenv').config();

const {
  NODE_ENV,
  JWT_SECRET,
  SALT_ROUNDS,
} = process.env;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorNotFound = require('../error-classes/ErrorNotFound');
const ErrorIncorrectData = require('../error-classes/ErrorIncorrectData');
const ErrorServer = require('../error-classes/ErrorServer');
const ErrorAuthentication = require('../error-classes/ErrorAuthentication');
const ErrorConflict = require('../error-classes/ErrorConflict');
const {
  messageNotFoundUser,
  messageIncorrectData,
  messageErrorServer,
  messageConflict,
  messageAuthentication,
} = require('../utils/errorMessage');
const {
  messageSuccessfulAuth,
  messageSuccessfulSignout,
} = require('../utils/messageSuccessfulRequest');


module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      next(new ErrorNotFound(messageNotFoundUser));
      return;
    }

    res.send(user);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      next(new ErrorIncorrectData(messageIncorrectData));
      return;
    }

    next(new ErrorServer(messageErrorServer));
  }
};

module.exports.editUserData = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      next(new ErrorNotFound(messageNotFoundUser));
      return;
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData(messageIncorrectData));
      return;
    }

    if (err.code === 11000) {
      next(new ErrorConflict(messageConflict));
      return;
    }

    next(new ErrorServer(messageErrorServer));
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const password = await bcrypt.hash(req.body.password, NODE_ENV === 'production'
      ? Number(SALT_ROUNDS)
      : 10);

    const {
      name,
      email,
    } = req.body;

    const user = await User.create({
      email,
      password,
      name,
    });

    res.send(user.toJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData(messageIncorrectData));
      return;
    }

    if (err.code === 11000) {
      next(new ErrorConflict(messageConflict));
      return;
    }

    next(new ErrorServer(messageErrorServer));
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select('+password');

    if (!user) {
      next(new ErrorAuthentication(messageAuthentication));
      return;
    }

    const resultCompar = await bcrypt.compare(password, user.password);

    if (!resultCompar) {
      next(new ErrorAuthentication(messageAuthentication));
      return;
    }

    const token = jwt.sign({ _id: user._id }, (NODE_ENV === 'production')
      ? JWT_SECRET
      : 'secret',
    { expiresIn: '1d' });

    res.cookie('token', token, {
      maxAge: 3600000 * 24,
      httpOnly: true,
      sameSite: false,
    })
      .send({ message: messageSuccessfulAuth });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData(messageIncorrectData));
      return;
    }

    next(new ErrorServer(messageErrorServer));
  }
};

module.exports.logOut = async (req, res, next) => {
  try {
    res.clearCookie('token')
      .send({ message: messageSuccessfulSignout });
  } catch (err) {
    next(new ErrorServer(messageErrorServer));
  }
};
