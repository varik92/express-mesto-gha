const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.getUserId = (req, res) => {
  const { userId } = req.params;

  User.findById(userId).then((user) => {
    if (user) {
      return res.send({ data: user });
    }
    return res.status(404).send({ message: 'Пользователь по указанному id не найден' });
  }).catch((err) => {
    if (err.name === 'CastError') {
      return res.status(400).send({ message: 'Переданы некорректные данные' });
    }
    return res.status(500).send({ message: err.message });
  });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  ).then((user) => {
    if (!user) {
      return res.status(404).send({ message: 'Пользователь по указанному id не найден' });
    }
    return res.send({ data: user });
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
    } else if (err.name === 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
    } else {
      res.status(500).send({ message: err.message });
    }
  });
};

module.exports.changeAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  ).then((user) => {
    if (!user) {
      return res.status(404).send({ message: 'Пользователь с указанным id не найден' });
    }
    return res.send({ data: user });
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    } else if (err.name === 'CastError') {
      res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    } else {
      res.status(500).send({ message: err.message });
    }
  });
};
