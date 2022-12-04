const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { auth } = require('./middlewares/auth');
const routerAuth = require('./routes/auth');
const NotFound = require('./errors/NotFound');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const corsHandler = require('./middlewares/corsHandler');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(requestLogger);

app.use(corsHandler);

app.use('/', routerAuth);

app.use(auth);

app.use(routerUsers);
app.use(routerCards);

app.use('*', (req, res, next) => next(new NotFound('Неправильный путь')));

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT);
