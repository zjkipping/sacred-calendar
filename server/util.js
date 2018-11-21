const errorCatcher = (err) => {
  // catches general error in connecting to the DB
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    res.status(503).send({ error: true, code: err.code, message: err.message });
  } else {
    console.log(err);
    // catches any other errors resulting from DB queries
    res.status(500).send({ error: true, code: err.code, message: err.message });
  }
}

module.exports = {
  handleUncaughtError: errorCatcher,
  getFriendRequestTypeAhead: async (req, res) => {
    // TODO: don't return usernames that are already on the user's friend list
    try {
      if (req.query.username) {
        // updates the category in the DB from the info provided in the request's body
        const [rows, _fields] = await pool.execute(
          'SELECT username, id FROM UserLogin WHERE username LIKE ? AND id != ? LIMIT 10',
          [req.query.username + '%', req.id]
        );
        // send back the typeahead options with a '200' OK
        res.status(200).send(rows);
      } else {
        res.status(400).send({ error: true, code: 'NO_QUERY', message: 'Missing the username query parameter'});
      }
    } catch (err) {
      // handle any other errors
      errorCatcher(err);
    }
  }
}
