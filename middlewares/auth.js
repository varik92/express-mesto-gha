const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'dev-secret' } = process.env;

const Unauthorized = require('../errors/Unauthorized');

module.exports.auth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new Unauthorized('Необходимо авторизироваться'));
  }

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new Unauthorized('Необходимо авторизироваться'));
  }

  req.user = payload;

  return next();
};
