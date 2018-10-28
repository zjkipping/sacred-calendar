const CONFIG = require('./config');
const model = require('./setup');
const express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
const { promisify } = require('util');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', require('./router'));

const runServer = async () => {
  if (CONFIG.production) {
    await model.setup();
  }
  const port = process.env.PORT || CONFIG.port || 8080;
  await promisify(app.listen).bind(app)(port);
  console.log('Started server on port: ' + port);
}

runServer();
