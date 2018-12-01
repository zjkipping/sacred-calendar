const Moment = require('moment');
const MomentRange = require('moment-range');
// combines both of the above into 1 moment object
const moment = MomentRange.extendMoment(Moment);

const errorCatcher = (err, res) => {
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
  checkTimeConflicts: (start, end, event) => {
    const startTime = moment.unix(start);
    if (end) {
      const userRange = moment.range(startTime, moment.unix(end));
      if (event.endTime) {
        const eventRange = moment.range(moment.unix(event.startTime), moment.unix(event.endTime));
        return userRange.overlaps(eventRange);
      } else {
        return userRange.contains(moment.unix(event.startTime));
      }
    } else {
      if (event.endTime) {
        const eventRange = moment.range(moment.unix(event.startTime), moment.unix(event.endTime));
        return eventRange.contains(startTime);
      } else {
        return startTime.seconds(0).milliseconds(0).unix() === moment.unix(event.startTime).seconds(0).milliseconds(0).unix() ;
      }
    }
  },
  getFriendRequestTypeAhead: async (req, res) => {
    try {
      if (req.query.username) {
        // selects user's that have a name that begins with the query, isn't the authed user, and isn't a friend of the authed user
        const [rows, _fields] = await pool.execute(
          'SELECT username, id FROM UserLogin WHERE username LIKE ? AND id != ? AND id NOT IN (SELECT Friendship.targetID FROM Friendship WHERE Friendship.userID = ?) LIMIT 10',
          [req.query.username + '%', req.id, req.id]
        );
        // send back the typeahead options with a '200' OK
        res.status(200).send(rows);
      } else {
        res.status(400).send({ error: true, code: 'NO_QUERY', message: 'Missing the username query parameter'});
      }
    } catch (err) {
      // handle any other errors
      errorCatcher(err, res);
    }
  }
}
