const Card = require('../models/card');
const {
  statusBadRequest,
  statusNotFound,
  statusInternalServerError,
} = require('../utils/constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(statusInternalServerError).send({ message: 'Произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  const id = req.user._id;

  Card.create({ name, link, owner: id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(statusBadRequest).send({ message: 'Переданы некорректные данные при создании карточки' });
      }
      return res.status(statusInternalServerError).send({ message: 'Произошла ошибка' });
    });
};

module.exports.deleteCardId = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (card) {
        return res.send({ message: 'Карточка успешна удалена' });
      }
      return res.status(statusNotFound).send({ message: 'Карточка с указанным id не найдена.' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(statusBadRequest).send({ message: 'Переданы некорректные данные' });
      }
      return res.status(statusInternalServerError).send({ message: 'Произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      return res.status(statusNotFound).send({ message: 'Передан несуществующий id карточки' });
    }
    return res.send({ data: card });
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(statusBadRequest).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
      }
      return res.status(statusInternalServerError).send({ message: 'Произошла ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      return res.status(statusNotFound).send({ message: 'Передан несуществующий id карточки' });
    }
    return res.send({ data: card });
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(statusBadRequest).send({ message: 'Переданы некорректные данные для постановки/снятии лайка.' });
      }
      return res.status(statusInternalServerError).send({ message: 'Произошла ошибка' });
    });
};
