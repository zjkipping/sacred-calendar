const CONFIG = require('./config');
const model = require('./setup');
const express = require('express');
var bodyParser = require('body-parser');
const { promisify } = require('util');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', require('./router'));

const runServer = async () => {
  if (process.env.NODE_ENV.includes('prod')) {
    await model.setup();
  }
  const port = CONFIG.port || 3000;
  await promisify(app.listen).bind(app)(port);
  console.log('Started server on port: ' + port);
}

runServer();
