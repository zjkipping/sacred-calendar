const CONFIG = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

module.exports = {
  register: async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hashSync(req.body.password, saltRounds);
      await connection.query('START TRANSACTION');
      const [result] = await connection.query('INSERT INTO `UserLogin` (username, password) VALUES (?, ?)', [req.body.username, hashedPassword]);
      await connection.query(
        'INSERT INTO `UserDetails` (userID, firstName, lastName, email, signUpDate) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
        [result.insertId, req.body.firstName, req.body.lastName, req.body.email]
      );
      connection.query('COMMIT');
      res.status(200).send();
    } catch (err) {
      console.log(err);
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message.includes('email')) {
          res.status(400).send({ error: true, code: 'DUP_EMAIL', message: 'That email already exists.' });
        } else if (err.message.includes('username')) {
          res.status(400).send({ error: true, code: 'DUP_NAME', message: 'That username already exists.' });
        } else {
          res.status(400).send({ error: true, code: 'DUP_VALUE', message: err.message });
        }
      } else {
        res.status(500).send({ error: true, code: err.code, message: err.message });
      }
    }
  },
  login: async (req, res) => {
    try {
      const [rows, _fields] = await connection.execute('SELECT id, password from `UserLogin` where username = ?', [req.body.username]);
      if (rows.length === 0) {
        res.status(400).send({ error: true, code: 'NO_RESULT', message: 'No such user that matches given username & password' });
      } else {
        const id = rows[0].id;
        const password = rows[0].password;
        const valid = await bcrypt.compareSync(req.body.password, password);
        if (valid) {
          const token = jwt.sign({ uid: id } , CONFIG.tokenSecret, { expiresIn: CONFIG.tokenLife});

          const refreshToken = jwt.sign({ uid: id } , CONFIG.refreshTokenSecret, { expiresIn: CONFIG.refreshTokenLife});
          const hashedRefreshToken = await bcrypt.hashSync(refreshToken, saltRounds);

          await connection.execute('INSERT INTO TokenAuth (userID, token) values (?, ?)', [id, hashedRefreshToken]);
          res.status(200).send({ token, refreshToken });
        } else {
          res.status(400).send({ error: true, code: 'NO_RESULT', message: 'No such user that matches given username & password' });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      const decoded = jwt.decode(refreshToken);
      const id = decoded.uid;
      const [rows, _fields] = await connection.execute('select token from TokenAuth WHERE userID = ?', [id]);
      rows.forEach(async (row) => {
        const match = await bcrypt.compareSync(refreshToken, row.token);
        if (match) {
          await connection.execute('delete from TokenAuth WHERE userID = ? AND token = ?', [id, row.token]);
        }
      });
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  }
};
