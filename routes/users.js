const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { linkRegExp } = require('../utils/regExp');
const {
  getUsers, getUserId, updateUser, changeAvatar, getMe,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', getMe);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserId);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(linkRegExp),
  }),
}), changeAvatar);

module.exports = router;
