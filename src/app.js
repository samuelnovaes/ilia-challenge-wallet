const express = require('express');
const compression = require('compression');
const cors = require('cors');
const auth = require('./middlewares/auth');

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/wallets', auth, require('./routes/wallets.route'));

module.exports = app;