const CONFIG = require('./config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  checkToken: async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, CONFIG.tokenSecret, (err, _decoded) => {
        if (err) {
          return res.status(401).json({ error: true, code: 'EXP_TOK', message: 'Token has expired.' });
        }
        req.id = _decoded.uid;
        next();
      });
    } else {
      return res.status(401).send({ error: true, code: 'NO_TOK',  message: 'No token provided.' });
    }
  },
  refreshToken: async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;  
      const decoded = jwt.decode(refreshToken);
      const id = decoded.uid;
      const [rows, _fields] = await pool.execute('SELECT token from `TokenAuth` where userID = ?', [id]);
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
            await pool.execute('DELETE FROM TokenAuth WHERE userID = ? AND token = ?', [id, row.token]);
            res.status(403).send({ error: true, code:'NO_AUTH', message: 'Unauthorized access.' });
          }
          return;
        }
      });
    } catch (err) {
      console.log(err);
      res.status(404).send({ error: true, code:'INV_REQ', message: 'Invalid request' });
    }
  }
}
