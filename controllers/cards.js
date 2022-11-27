const Card = require('../models/card');

const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const InternalServerError = require('../errors/InternalServerError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err.message));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  const id = req.user._id;
  Card.create({ name, link, owner: id })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Переданы некорректные данные при создании карточки'));
      }
      return next(new InternalServerError('Произошла ошибка'));
    });
};

module.exports.deleteCardId = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не существует, либо была удалена');
      }
      if (req.user._id !== card.owner.toString()) {
        throw new Forbidden('Нельзя удалить карточку другого пользователя');
      }

      return Card.findByIdAndRemove(cardId);
    })
    .then(() => {
      res.send({ message: 'Карточка успешна удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      return next(new NotFound('Передан несуществующий id карточки'));
    }
    return res.send({ data: card });
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные для постановки/снятии лайка.'));
      }
      return next(new InternalServerError('Произошла ошибка'));
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (card) {
      return res.send({ data: card });
    }
    return next(new NotFound('Передан несуществующий id карточки'));
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные для постановки/снятии лайка.'));
      }
      return next(new InternalServerError('Произошла ошибка'));
    });
};
