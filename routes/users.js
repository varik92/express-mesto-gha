const router = require('express').Router();

const {
  getUsers, getUserId, createUser, updateUser, changeAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/:userId', getUserId);
router.post('/users', createUser);
router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', changeAvatar);

module.exports = router;
