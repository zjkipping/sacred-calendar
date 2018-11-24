const _ = require('lodash');
const util = require('./util');
const Moment = require('moment');
const MomentRange = require('moment-range');
// combines both of the above into 1 moment object
const moment = MomentRange.extendMoment(Moment);

module.exports = {
  // returns the details of the authenticated user
  self: async (req, res) => {
    try {
      // selects all the user details fields from the DB
      const [rows] = await pool.execute(`
          SELECT username, firstName, lastName, email, signUpDate
          FROM UserDetails
          INNER JOIN UserLogin ON UserDetails.userID=UserLogin.id
          WHERE id = ?
        `, 
        [req.id]
      );
      // sends back the details with a '200' OK
      res.status(200).send(rows[0]);
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  events: async (req, res) => {
    try {
      // select all the events from the DB for the authenticated user
      const [rows] = await pool.execute(`
          SELECT Event.id, Event.created, Event.name, Event.description, Event.location, Event.date, Event.startTime, Event.endTime, Category.id as categoryID, Category.name as categoryName, Category.color as categoryColor
          FROM Event
          LEFT JOIN Category ON Event.categoryID = Category.id
          WHERE Event.userID = ?
        `,
        [req.id]
      );
      // sends back the events wrapped in their own object with a '200' OK
      res.status(200).send(_.map(rows, row => {
        return {
          id: row.id,
          created: row.created,
          name: row.name,
          description: row.description,
          location: row.location,
          date: row.date,
          startTime: row.startTime,
          endTime: row.endTime,
          // wrap the category fields in a nested object
          category: {
            id: row.categoryID,
            name: row.categoryName,
            color: row.categoryColor
          }
        }
      }));
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  friendEvents: async (req, res) => {
    if (req.query.id) {
      try {
        // select all the events from the DB for the authenticated user
        const [rows] = await pool.execute(
          'SELECT targetID FROM Friendship WHERE id = ?',
          [req.query.id]
        );

        if (rows.length > 0) {
          const friendID = rows[0].targetID;

          const [events] = await pool.execute(`
              SELECT Event.id, Event.created, Event.name, Event.description, Event.location, Event.date, Event.startTime, Event.endTime, Category.id as categoryID, Category.name as categoryName, Category.color as categoryColor
              FROM Event
              LEFT JOIN Category ON Event.categoryID = Category.id
              WHERE Event.userID = ?
            `,
            [friendID]
          );
          // sends back the events wrapped in their own object with a '200' OK
          res.status(200).send(_.map(events, row => {
            return {
              id: row.id,
              created: row.created,
              name: row.name,
              description: row.description,
              location: row.location,
              date: row.date,
              startTime: row.startTime,
              endTime: row.endTime,
              // wrap the category fields in a nested object
              category: {
                id: row.categoryID,
                name: row.categoryName,
                color: row.categoryColor
              }
            }
          }));
        } else {
          res.status(400).send({ error: true, code: 'NO_FRIEND', message: 'Friendship doesn\'t exist for id provided' });
        }
      } catch (err) {
        // handle any other errors
        util.handleUncaughtError(err);
      }
    } else {
      res.status(400).send({ error: true, code: 'NO_PARAM', message: 'Missing friendship ID parameter' });
    }
  },
  categories: async (req, res) => {
    try {
      // selects all the categories for the authenticated user
      const [rows] = await pool.execute(
        'SELECT id, name, color FROM Category WHERE userID = ?',
        [req.id]
      );
      // sends back the categories with a '200' OK
      res.status(200).send(rows);
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  availability: async (req, res) => {
    if (req.query.start) {
      try {
        const start = req.query.start;
        const end = req.query.end;

        // getting the date from the start time
        const date = moment.unix(start).hours(0).minutes(0).seconds(0).milliseconds(0).unix();
        // get event columns of userID, username, startTime, and endTime from friends' events that are on the same date as the start time
        const [rows] = await pool.execute(
          `SELECT Event.userID, UserLogin.username, Event.startTime, Event.endTime
           FROM Event
           INNER JOIN UserLogin ON UserLogin.id = Event.userID
           WHERE Event.userID in (SELECT Friendship.targetID FROM Friendship WHERE Friendship.userID = ?) AND Event.date = ?
           GROUP BY Event.userID`,
          [req.id, date]
        );

        // creating an array that contains all the user's friends
        const allFriends = _.chain(rows).map(event => ({ id: event.userID, username: event.username })).uniq().value();

        // finds all the friends that AREN'T available
        const unavailableFriends = _.chain(rows).filter(event => {
          if (end) {
            const userRange = moment.range(moment.unix(start), moment.unix(end));
            if (event.endTime) {
              const eventRange = moment.range(moment.unix(event.startTime), moment.unix(event.endTime));
              return userRange.overlaps(eventRange);
            } else {
              return userRange.contains(moment.unix(event.startTime));
            }
          } else {
            if (event.endTime) {
              const eventRange = moment.range(moment.unix(event.startTime), moment.unix(event.endTime));
              return eventRange.contains(moment.unix(start));
            } else {
              return moment.unix(start).seconds(0).milliseconds(0) === moment.unix(event.startTime).seconds(0).milliseconds(0) ;
            }
          }
        }).map(event => ({ id: event.userID, username: event.username })).uniq().value();

        // removes all unavailable friends from main friends list
        const availableFriends = _.filter(allFriends, friend => !_.find(unavailableFriends, { id: friend.id }));

        res.status(200).send(availableFriends);
      } catch (err) {
        // handle any other errors
        util.handleUncaughtError(err);
      }
    } else {
      res.status(400).send({ error: true, code: 'NO_PARAM', message: 'Missing start parameter' });
    }
  },
  newEvent: async (req, res) => {
    try {
      // null check/set the optional values that are passed in the request
      const description = req.body.description ? req.body.description : null;
      const location = req.body.location ? req.body.location : null;
      const endTime = req.body.endTime ? req.body.endTime : null;
      const categoryID = req.body.categoryID ? req.body.categoryID : null;
      // insert a new Event into the DB using the provided info from the request body
      const [result] = await pool.execute(
        'INSERT INTO Event (userID, created, name, description, location, date, startTime, endTime, categoryID) VALUES (?, UNIX_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?)',
        [req.id, req.body.name, description, location, req.body.date, req.body.startTime, endTime, categoryID]
      );
      // send back a '200' OK
      res.status(200).send({ id : result.insertId});
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  updateEvent: async (req, res) => {
    try {
      // null check/set the optional values that are passed in the request
      const description = req.body.description ? req.body.description : null;
      const location = req.body.location ? req.body.location : null;
      const endTime = req.body.endTime ? req.body.endTime : null;
      const categoryID = req.body.categoryID ? req.body.categoryID : null;
      // Update the event in the DB with the provided info from the request body
      await pool.execute(
        'UPDATE Event SET name = ?, description = ?, location = ?, date = ?, startTime = ?, endTime = ?, categoryID = ? WHERE id = ?',
        [req.body.name, description, location, req.body.date, req.body.startTime, endTime, categoryID, req.body.id]
      );
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  deleteEvent: async (req, res) => {
    try {
      // delete the event in the DB that matches the ID provided in the request params
      await pool.execute(
        'DELETE FROM Event WHERE id = ?',
        [req.params.id]
      );
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  eventInvites: async (req, res) => {
    try {
      // retrieves the event invites from the database for the authenticated user
      const [rows] = await pool.execute(
        `
          SELECT EventInvite.id, UserLogin.username, Friendship.tag, EventInvite.created, Event.name, Event.description, Event.location, Event.date, Event.startTime, Event.endTime
          FROM EventInvite
          INNER JOIN UserLogin ON UserLogin.id = EventInvite.senderID
          INNER JOIN Event ON Event.id = EventInvite.eventID
          INNER JOIN Friendship ON Friendship.targetID = EventInvite.senderID
          WHERE recipientID = ?
        `,
        [req.id]
      );
      // send back a '200' OK
      res.status(200).send(rows);
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  eventInvite: async (req, res) => {
    const invites = req.body.invites;
    const eventID = req.body.id
    if (invites && invites.length > 0 && eventID) {
      try {
        // creates the two arrays for the query, the values & the prepared '?' parts
        let valuesQuery = '';
        let values = []
        for (let x = 0; x < invites.length; x++) {
          if (valuesQuery !== '') {
            valuesQuery += ', '
          }
          valuesQuery += '(?, ?, ?, UNIX_TIMESTAMP())';
          values.push(...[req.id, invites[x], eventID]);
        }
        // inserts the invites into the database
        await pool.execute(`INSERT INTO EventInvite (senderID, recipientID, eventID, created) VALUES ${valuesQuery}`, values)
        // send back a '200' OK
        res.status(200).send();
      } catch (err) {
        // handle any other errors
        util.handleUncaughtError(err);
      }
    } else {
      res.status(400).send({ error: true, code: 'NO_PARAM', message: 'One or more of the parameters are missing' });
    }
  },
  acceptEventInvite: async (req, res) => {
    if (req.body.id) {
      try {
        // gets the invite from the database
        const [invites] = await pool.execute(
          'SELECT eventID FROM EventInvite WHERE id = ?',
          [req.body.id]
        );
  
        const eventID = invites[0].eventID;
          
        // gets the event from the database based on the invite
        const [rows] = await pool.execute(
          'SELECT * FROM Event WHERE id = ?',
          [eventID]
        );

        await pool.execute(
          'DELETE FROM EventInvite WHERE id = ?',
          [req.body.id]
        )

        // checks to see if the event still exists
        if (rows.length > 0) {
          const event = rows[0];
          const description = event.description ? event.description : null;
          const location = event.location ? event.location : null;
          const endTime = event.endTime ? event.endTime : null;

          // inserts the event in the authenticated user's event list
          await pool.execute(
            'INSERT INTO Event (userID, created, name, description, location, date, startTime, endTime, categoryID) VALUES (?, UNIX_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?)',
            [req.id, event.name, description, location, event.date, event.startTime, endTime, null]
          );

          // send back a '200' OK
          res.status(200).send();
        } else {
          res.status(204).send({ error: true, code: 'NO_EVENT', message: 'The event specified doens\'t exist anymore' })
        }
      } catch (err) {
        // handle any other errors
        util.handleUncaughtError(err);
      }
    } else {
      res.status(400).send({ error: true, code: 'NO_PARAM', message: 'Missing ID parameter' });
    }
  },
  denyEventInvite: async (req, res) => {
    if (req.body.id) {
      try {
        // deletes the event invite from the database
        await pool.execute(
          'DELETE FROM EventInvite WHERE id = ?',
          [req.body.id]
        );
        // send back a '200' OK
        res.status(200).send();
      } catch (err) {
        // handle any other errors
        util.handleUncaughtError(err);
      }
    } else {
      res.status(400).send({ error: true, code: 'NO_PARAM', message: 'Missing ID parameter' });
    }
  },
  newCategory: async (req, res) => {
    try {
      // insert a new category into the DB based on the info provided from the request's body
      await pool.execute(
        'INSERT INTO Category (userID, name, color) VALUES (?, ?, ?)',
        [req.id, req.body.name, req.body.color]
      );
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  updateCategory: async (req, res) => {
    try {
      // updates the category in the DB from the info provided in the request's body
      await pool.execute(
        'UPDATE Category SET name = ?, color = ? WHERE id = ?',
        [req.body.name, req.body.color, req.body.id]
      );
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  deleteCategory: async (req, res) => {
    try {
      // update any events that have the to-be deleted category's ID to be null
      // await pool.query('START TRANSACTION');

      await pool.execute(
        'UPDATE Event SET categoryID = null WHERE categoryID = ?',
        [req.params.id]
      );
      // delete the category from the DB based on the ID provided in the request's params
      await pool.execute(
        'DELETE FROM Category WHERE id = ?',
        [req.params.id]
      );

      // await pool.query('COMMIT');
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  friendRequests: async (req, res) => {
    try {
      // selects all the friend requests for the authenticated user
      const [rows] = await pool.execute(`
          SELECT FriendRequest.id, username, FriendRequest.created
          FROM FriendRequest
          INNER JOIN UserLogin ON UserLogin.id = FriendRequest.senderID
          WHERE recipientID = ?
        `,
        [req.id]
      );
      // sends back the friends with a '200' OK
      res.status(200).send(rows);
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  sendFriendRequest: async (req, res) => {
    try {
      // insert a friend request into the database
      await pool.execute(
        'INSERT INTO FriendRequest (senderID, recipientID, created) VALUES (?, ?, UNIX_TIMESTAMP())',
        [req.id, req.body.id]
      );
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  acceptFriendRequest: async (req, res) => {
    try {
      // accepts the specified friend request

      // TODO: figure out why transactions are reverting when no errors are present...
      // await pool.query('START TRANSACTION');

      // grab the sender/recipient from the database based on the requestID provided
      const [rows] = await pool.execute(
        'SELECT senderID, recipientID FROM FriendRequest WHERE id = ?',
        [req.body.id]
      );
      const sender = rows[0].senderID;
      const recipient = rows[0].recipientID;
      // delete the friend request
      await pool.execute(
        'DELETE FROM FriendRequest WHERE id = ?',
        [req.body.id]
      );

      // insert the two friendship rows into the database, one for each user.
      await pool.execute('INSERT INTO Friendship (userID, targetID) VALUES (?, ?), (?, ?)',
        [sender, recipient, recipient, sender]
      );

      // await pool.query('COMMIT');
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  denyFriendRequest: async (req, res) => {
    try {
      // denies the specified friend request
      await pool.execute(
        'DELETE FROM FriendRequest WHERE id = ?',
        [req.body.id]
      );
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  friends: async (req, res) => {
    try {
      // selects all the friends for the authenticated user
      const [rows] = await pool.execute(`
          SELECT Friendship.id, username, privacyType, tag
          FROM Friendship
          INNER JOIN UserLogin ON UserLogin.id = Friendship.targetID
          WHERE userID = ?
        `,
        [req.id]
      );
      // sends back the friends with a '200' OK
      res.status(200).send(rows);
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  updateFriend: async (req, res) => {
    try {
      // updates the row in the database based on the data provided
      await pool.execute(
        'UPDATE Friendship SET tag = ?, privacyType = ? WHERE id = ?',
        [req.body.tag, req.body.privacyType, req.body.id]
      );
      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  },
  removeFriend: async (req, res) => {
    if (req.params.id) {
      try {
        // get the friendship from the database
        const [rows] = await pool.execute(
          'Select userID, targetID FROM Friendship WHERE id = ?',
          [req.params.id]
        );
        const user = rows[0].userID;
        const target = rows[0].targetID;
        // get the friend's friendship row
        const [rows2] = await pool.execute(
          'Select id FROM Friendship WHERE userID = ? AND targetID = ?',
          [target, user]
        );
        // delete both user's friendship row from the database
        await pool.execute(
          'DELETE FROM Friendship WHERE id = ? OR id = ?',
          [req.params.id, rows2[0].id]
        );
        // send back a '200' OK
        res.status(200).send();
      } catch (err) {
        // handle any other errors
        util.handleUncaughtError(err);
      }
    } else {
      res.status(400).send({ error: true, code: 'NO_PARAM', message: 'Missing ID parameter' });
    }
  },
  statistics: async (req, res) => {
    try {
      // TODO get statistics based on minutes in each category and return an object for each category (mins, %, ect...)

      // send back a '200' OK
      res.status(200).send();
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
  }
};
