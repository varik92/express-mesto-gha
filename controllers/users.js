const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const InternalServerError = require('../errors/InternalServerError');
const EmailExist = require('../errors/EmailExist');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => next(new InternalServerError('Произошла ошибка')));
};

module.exports.getUserId = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId).then((user) => {
    if (user) {
      return res.send({ data: user });
    }
    return next(new NotFound('Пользователь по указанному id не найден'));
  }).catch((err) => {
    if (err.name === 'CastError') {
      return next(new BadRequest('Переданы некорректные данные'));
    }
    return next(new InternalServerError('Произошла ошибка'));
  });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  const createUser = (hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  });

  bcrypt
    .hash(password, 10)
    .then((hash) => createUser(hash))
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
      _id: user._id,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      }
      if (err.code === 11000) {
        return next(new EmailExist('Пользователь с таким Email уже существует'));
      }
      return next(new InternalServerError('Произошла ошибка'));
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  ).then((user) => {
    if (!user) {
      return next(new NotFound('Пользователь по указанному id не найден'));
    }
    return res.send({ data: user });
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные при обновлении профиля'));
    } else if (err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные при обновлении профиля'));
    } else {
      next(new InternalServerError('Произошла ошибка'));
    }
  });
};

module.exports.changeAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  ).then((user) => {
    if (!user) {
      return next(new NotFound('Пользователь с указанным id не найден'));
    }
    return res.send({ data: user });
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
    } else if (err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
    } else {
      next(new InternalServerError('Произошла ошибка'));
    }
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password, next)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.cookie('token', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      });
      return res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getMe = (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      return next(new NotFound('Пользователь не существует, либо был удален'));
    })
    .catch(() => next(new InternalServerError('Произошла ошибка')));
};
