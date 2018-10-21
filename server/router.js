const CONFIG = require('./config');
const tokenUtil = require('./token-util');
const auth = require('./auth');

const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const startRoutes = async () => {
  connection = await mysql.createConnection(CONFIG.dbCredentials);

  router.post('/register', auth.register);

  router.post('/login', auth.login);

  router.post('/logout', auth.logout);

  router.post('/token', tokenUtil.refreshToken);

  router.use(tokenUtil.checkToken);
  // anything below here requires a token to use
  // the user's ID is passed to req.id below here

  router.get('/self', async (req, res) => {
    try {
      const [rows, _fields] = await connection.execute(
        'SELECT username, firstName, lastName, email, signUpDate from `UserDetails` INNER JOIN UserLogin ON UserDetails.userID=UserLogin.id WHERE id = ?', 
        [req.id]
      );
      res.status(200).send(rows[0]);
    } catch (err) {
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  });
};

startRoutes();

module.exports = router;
