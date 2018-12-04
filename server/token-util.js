const CONFIG = require('./config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  checkToken: async (req, res, next) => {
    // grab the clientToken from any possible locations inside the request
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    // check to see if it actually exists on the request
    if (token) {
      // verify the token hasn't expired
      jwt.verify(token, CONFIG.tokenSecret, (err, _decoded) => {
        if (err) {
          // verification errored out, meaning the token is expired
          // send back a '401' error for the expired token
          return res.status(401).json({ error: true, code: 'EXP_TOK', message: 'Token has expired.' });
        }
        // no error, tack the decoded ID onto the request object
        req.id = _decoded.uid;
        // finish the middleware and continue onto the api route
        next();
      });
    } else {
      // if the token doesn't exist on the request, send back '401' for the unprovided token
      return res.status(401).send({ error: true, code: 'NO_TOK',  message: 'No token provided.' });
    }
  },
  refreshToken: async (req, res) => {
    try {
      // grab the refresh token off the request's body
      const refreshToken = req.body.refreshToken;
      // decode the refreshToken
      const decoded = jwt.decode(refreshToken);
      // grab the user's ID off the decoded token object
      const tokenID = decoded.tokenID;
      const uid = decoded.uid;
      // grab all the refreshTokens belonging to the user's ID
      const [rows, _fields] = await pool.execute('SELECT token from `TokenAuth` where id = ?', [tokenID]);

      if (rows.length > 0) {
        const dbToken = rows[0].token;
        const match = await bcrypt.compareSync(refreshToken, dbToken);
        if (match) {
          try {
            // check to see if the refreshToken has expired
            if (jwt.verify(refreshToken, CONFIG.refreshTokenSecret)) {
              // create new clientToken since refreshToken was valid
              const token = jwt.sign({ uid } , CONFIG.tokenSecret, { expiresIn: CONFIG.tokenLife});
              // send back a '200' OK to the client along with the new clientToken
              res.status(200).send({ token });
            } else {
              // throw an error that the token isn't valid (expired)
              throw 'Token is invalid';
            }
          } catch (err) {
            // catch any expired token errors and delete the token from the DB
            await pool.execute('DELETE FROM TokenAuth WHERE id = ?', [tokenID]);
            // send back a '403' error, since the user's device auth has expired
            res.status(403).send({ error: true, code:'NO_AUTH', message: 'Unauthorized access.' });
          }
        }
      } else {
        res.status(403).send({ error: true, code:'NO_AUTH', message: 'Unauthorized access.' });
      }
    } catch (err) {
      console.log(err);
      // send back a '404' error since the request is invalid
      res.status(404).send({ error: true, code:'INV_REQ', message: 'Invalid request' });
    }
  }
}
