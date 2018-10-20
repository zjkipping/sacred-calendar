const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

module.exports = {
  register: async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hashSync(req.body.password, saltRounds);
      const [result] = await connection.execute('INSERT INTO `UserLogin` (email, password) VALUES (?, ?)', [req.body.email, hashedPassword]);
      await connection.execute(
        'INSERT INTO `UserDetails` (userID, firstName, lastName, email, signUpDate) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())', 
        [result.insertId, req.body.firstName, req.body.lastName, req.body.email]
      );

      res.status(200).send();
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).send({ error: true, code: 'DUP_NAME', message: 'That email already exists.' });
      } else {
        res.status(500).send({ error: true, code: err.code, message: err.message });
      }
    }
  },
  login: async (req, res) => {
    try {
      const [rows, _fields] = await connection.execute('SELECT id, password from `UserLogin` where email = ?', [req.body.email]);
      if (rows.length === 0) {
        res.status(400).send({ error: true, code: 'NO_RESULT', message: 'No such user that matches given email & password' });
      } else {
        const id = rows[0].id;
        const password = rows[0].password;
        const valid = await bcrypt.compareSync(req.body.password, password);
        if (valid) {
          const token = jwt.sign({ uid: id } , CONFIG.tokenSecret, { expiresIn: CONFIG.tokenLife});

          const refreshToken = jwt.sign({ uid: id } , CONFIG.refreshTokenSecret, { expiresIn: CONFIG.refreshTokenLife});
          const hashedRefreshToken = await bcrypt.hashSync(refreshToken, saltRounds);

          await connection.execute('INSERT INTO TokenAuth (userID, token) values (?, ?)', [id, hashedRefreshToken]);
          res.status(200).send({ id, token, refreshToken });
        } else {
          res.status(400).send({ error: true, code: 'NO_RESULT', message: 'No such user that matches given username & password' });
        }
      }
    } catch (err) {
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      const id = req.body.id;
      const hashedRefreshToken = await bcrypt.hashSync(req.body.refreshToken, saltRounds);
      await connection.execute('DELETE FROM TokenAuth WHERE userID = ? AND refreshToken = ?', [id, hashedRefreshToken]);
      res.status(200).send();
    } catch (err) {
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  }
};
