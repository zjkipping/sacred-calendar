const CONFIG = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('./util');

module.exports = {
  // used to register a new user into the system
  register: async (req, res) => {
    try {
      // hashing/salting the password provided, saltRounds comes from the Config file
      const hashedPassword = await bcrypt.hashSync(req.body.password, CONFIG.saltRounds);
      // starting a SQL transaction (batch query)
      await pool.query('START TRANSACTION');
      // inserting the provided info into the DB's UserLogin table and waiting for a result before continuing
      const [result] = await pool.query('INSERT INTO `UserLogin` (username, password) VALUES (?, ?)', [req.body.username, hashedPassword]);
      // inserting the provided info into the DB's UserDetails table and waiting for a result before continuing (uses insertId from previous insert)
      await pool.query(
        'INSERT INTO `UserDetails` (userID, firstName, lastName, email, signUpDate) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
        [result.insertId, req.body.firstName, req.body.lastName, req.body.email]
      );
      // commits the transaction in the DB
      pool.query('COMMIT');
      // sending back a '200' OK message to the client
      res.status(200).send();
    } catch (err) {
      console.log(err);
      // catches any duplicate errors from the DB (username & email are UNIQUE in their respective tables)
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message.includes('email')) {
          // duplicate email was given, send back appropriate error
          res.status(400).send({ error: true, code: 'DUP_EMAIL', message: 'That email already exists.' });
        } else if (err.message.includes('username')) {
          // duplicate username was given, send back appropriate error
          res.status(400).send({ error: true, code: 'DUP_NAME', message: 'That username already exists.' });
        } else {
          // generic else catcher, just in case
          res.status(400).send({ error: true, code: 'DUP_VALUE', message: err.message });
        }
      } else {
        // handle any other errors
        util.handleUncaughtError(err);
      }
    }
  },
  // used to log a user into the system
  login: async (req, res) => {
    try {
      // selects the ID and password from the database from the username provided
      const [rows, _fields] = await pool.execute('SELECT id, password from `UserLogin` where username = ?', [req.body.username]);
      if (rows.length === 0) {
        // send back '400' error due to no existing username in the DB matching the provided username
        res.status(400).send({ error: true, code: 'NO_RESULT', message: 'No such user that matches given username & password' });
      } else {
        // found user's data matching their username, grabbing id & password from request's body
        const id = rows[0].id;
        const password = rows[0].password;
        // checking to see if the password provided matches the password in the DB
        //    (essentially hashes/salts the provided password (the same way) and verifies the two hashes are the same)
        const valid = await bcrypt.compareSync(req.body.password, password);
        if (valid) {
          // create a clientToken/authToken using the settings from the config and the user's ID as the data
          const token = jwt.sign({ uid: id } , CONFIG.tokenSecret, { expiresIn: CONFIG.tokenLife});
          // create a refreshToken using the settings from the config and the user's ID as the data
          const refreshToken = jwt.sign({ uid: id } , CONFIG.refreshTokenSecret, { expiresIn: CONFIG.refreshTokenLife});
          // hash the refreshToken to so it can be stored in the DB
          const hashedRefreshToken = await bcrypt.hashSync(refreshToken, CONFIG.saltRounds);
          // inserting the hashed refreshToken and user's id into the TokenAuth table
          await pool.execute('INSERT INTO TokenAuth (userID, token) values (?, ?)', [id, hashedRefreshToken]);
          // sending back a '200' OK message to the client with the clienToken & refreshToken as a body
          res.status(200).send({ token, refreshToken });
        } else {
          // send back '400' error due to the hashed password not matching
          res.status(400).send({ error: true, code: 'NO_RESULT', message: 'No such user that matches given username & password' });
        }
      }
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  // used to logout the user from the system
  logout: async (req, res) => {
    try {
      // grab the refresh token from the request's body and decode it
      const refreshToken = req.body.refreshToken;
      const decoded = jwt.decode(refreshToken);
      // grab the ID from the decoded token
      const id = decoded.uid;
      // grab all the refreshTokens belonging to the user's ID
      const [rows, _fields] = await pool.execute('select token from TokenAuth WHERE userID = ?', [id]);
      rows.forEach(async (row) => {
        // find a token that matches the refresh token provided
        const match = await bcrypt.compareSync(refreshToken, row.token);
        if (match) {
          // delete the table row if the token from the DB matches the one provided in the request
          await pool.execute('delete from TokenAuth WHERE userID = ? AND token = ?', [id, row.token]);
        }
      });
      // sending back a '200' OK message to the client
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  }
};
