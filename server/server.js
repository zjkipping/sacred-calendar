const CONFIG = require('./config');
const model = require('./setup');
const express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
const { promisify } = require('util');

// creates the express app
const app = express();

// sets the CORS settings for the app, allowing all domains to access
app.use(cors());
app.options('*', cors());

// sets the body of the responses to be JSON and encoded as a URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// useful for when pinging the server
app.get('/', async (req, res) => {
  return res.status(200).send({});
});

// runs the router.js for any routes going to /api (this is the only parent route)
app.use('/api', require('./router'));

const runServer = async () => {
  // If the server is in production mode, run the DB (model) setup
  if (CONFIG.production) {
    // waits for the model to be setup before continuing
    await model.setup();
  }
  // sets the port for the app, either from Heroku's env settings, the config settings, or 8080 by default
  const port = process.env.PORT || CONFIG.port || 8080;
  // wait for the app to start listening on the port created above
  await promisify(app.listen).bind(app)(port);
  console.log('Started server on port: ' + port);
}

// starts the server
runServer();
