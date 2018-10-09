const CONFIG = require('./config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  checkToken: async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, CONFIG.tokenSecret, (err, _decoded) => {
        if (err) {
          return res.status(401).json({ error: true, code: 'NO_AUTH', message: 'Unauthorized access.' });
        }
        next();
      });
    } else {
      return res.status(403).send({ error: true, code: 'NO_TOK',  message: 'No token provided.' });
    }
  },
  refreshToken: async (req, res) => {
    try {
      const id = req.body.id;
      const refreshToken = req.body.refreshToken;  
      const [rows, _fields] = await connection.execute('SELECT token from `TokenAuth` where userID = ?', [id]);
      rows.forEach(async (row) => {
        const match = await bcrypt.compareSync(refreshToken, row.token);
        if (match) {
          try {
            if (jwt.verify(refreshToken, CONFIG.refreshTokenSecret)) {
              const token = jwt.sign({ uid: id } , CONFIG.tokenSecret, { expiresIn: CONFIG.tokenLife});
              res.status(200).send({ token });
            } else {
              throw 'Token is invalid';
            }
          } catch (err) {
            const hashedRefreshToken = await bcrypt.hashSync(req.body.refreshToken, saltRounds);
            await connection.execute('DELETE FROM TokenAuth WHERE userID = ? AND refreshToken = ?', [id, hashedRefreshToken]);
            res.status(401).send({ error: true, code:'NO_AUTH', message: 'Unauthorized access.' });
          }
          return;
        }
      });
    } catch (err) {
      res.status(404).send({ error: true, code:'INV_REQ', message: 'Invalid request' });
    }
  }
}
