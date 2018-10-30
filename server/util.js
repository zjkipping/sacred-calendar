module.exports = {
  handleUncaughtError = (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      res.status(503).send({ error: true, code: err.code, message: err.message });
    } else {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  }
}
