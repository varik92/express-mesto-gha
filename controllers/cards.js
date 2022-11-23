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
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании карточки'));
      }
      next(new InternalServerError('Произошла ошибка'));
    });
};

module.exports.deleteCardId = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        next(new NotFound('Карточка не существует, либо была удалена'));
        return;
      }
      if (req.user._id === card.owner) {
        Card.findByIdAndRemove(cardId)
          .then((cardDelete) => {
            if (cardDelete) {
              return res.send({ message: 'Карточка успешна удалена' });
            }
            return next(new InternalServerError('Произошла ошибка'));
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequest('Переданы некорректные данные'));
            }
            next(new InternalServerError('Произошла ошибка'));
          });
      } else {
        next(new Forbidden('Нельзя удалить карточку другого пользователя'));
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      next(new NotFound('Передан несуществующий id карточки'));
    }
    return res.send({ data: card });
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для постановки/снятии лайка.'));
      }
      next(new InternalServerError('Произошла ошибка'));
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      next(new NotFound('Передан несуществующий id карточки'));
    }
    return res.send({ data: card });
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для постановки/снятии лайка.'));
      }
      next(new InternalServerError('Произошла ошибка'));
    });
};
