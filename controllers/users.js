// eslint-disable-next-line import/no-extraneous-dependencies
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


module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      next(new ErrorNotFound('Пользователь не найден'));
      return;
    }

    res.send(user);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      next(new ErrorIncorrectData('Некорректный id пользователя'));
      return;
    }

    next(new ErrorServer('Произошла ошибка на сервере'));
  }
};

module.exports.editUserData = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      next(new ErrorNotFound('Пользователя с таким id не найдено'));
      return;
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData('Переданы некорректные данные'));
      return;
    }

    next(new ErrorServer('Произошла ошибка на сервере'));
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
      name,
      email,
      password,
    });

    res.send(user.toJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData('Переданы некорректные данные'));
      return;
    }

    if (err.code === 11000) {
      next(new ErrorConflict('Пользователь с указанным email уже зарегистрирован'));
      return;
    }

    next(new ErrorServer('Произошла ошибка на сервере'));
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select('+password');

    if (!user) {
      next(new ErrorAuthentication('Неверный email или пароль'));
      return;
    }

    const resultCompar = await bcrypt.compare(password, user.password);

    if (!resultCompar) {
      next(new ErrorAuthentication('Неверный email или пароль'));
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
      .send({ password: user.password })
      .end();
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ErrorIncorrectData('Переданы некорректные данные'));
      return;
    }

    next(new ErrorServer('Произошла ошибка на сервере'));
  }
};

module.exports.logOut = async (req, res, next) => {
  try {
    if (!req.cookies) {
      next(new ErrorAuthentication('Вы не авторизованы'));
      return;
    }

    res.clearCookie('token')
      .send()
      .end();
  } catch (err) {
    next(new ErrorServer('Произошла ошибка на сервере'));
  }
};
