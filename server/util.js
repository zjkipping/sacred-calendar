module.exports = {
  handleUncaughtError: (err) => {
    // catches general error in connecting to the DB
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      res.status(503).send({ error: true, code: err.code, message: err.message });
    } else {
      console.log(err);
      // catches any other errors resulting from DB queries
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  }
}
