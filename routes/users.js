const router = require('express').Router();

const {
  getUsers, getUserId, updateUser, changeAvatar, getMe,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getMe);
router.get('/users/:userId', getUserId);
router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', changeAvatar);

module.exports = router;
