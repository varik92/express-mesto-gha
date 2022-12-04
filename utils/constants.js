const statusBadRequest = 400;
const statusNotFound = 404;
const statusInternalServerError = 500;

const allowedCors = [
  'https://mesto.front.v92.nomoredomains.club',
  'http://mesto.front.v92.nomoredomains.club',
  'localhost:3000',
];

const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

module.exports = {
  statusBadRequest,
  statusNotFound,
  statusInternalServerError,
  allowedCors,
  DEFAULT_ALLOWED_METHODS,
};
