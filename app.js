const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { auth } = require('./middlewares/auth');
const routerAuth = require('./routes/auth');
const NotFound = require('./errors/NotFound');
const errorHandler = require('./middlewares/errorHandler');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(routerUsers);

app.use(auth);
app.use('/', routerAuth);

app.use(routerCards);

app.use('*', (req, res, next) => next(new NotFound('Неправильный путь')));

app.use(errors());
app.use(errorHandler);

app.listen(PORT);
