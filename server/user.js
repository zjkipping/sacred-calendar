const _ = require('lodash');
const util = require('./util');

module.exports = {
  // returns the details of the authenticated user
  self: async (req, res) => {
    try {
      // selects all the user details fields from the DB
      const [rows, _fields] = await pool.execute(`
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
      const [rows, _fields] = await pool.execute(`
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
  categories: async (req, res) => {
    try {
      // selects all the categories for the authenticated user
      const [rows, _fields] = await pool.execute(
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
    try {
      // TODO: write this function
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
    // for now send back a 404 since this route isn't implemented
    res.status(404).send();
  },
  newEvent: async (req, res) => {
    try {
      // null check/set the optional values that are passed in the request
      const description = req.body.description ? req.body.description : null;
      const location = req.body.location ? req.body.location : null;
      const endTime = req.body.endTime ? req.body.endTime : null;
      const categoryID = req.body.categoryID ? req.body.categoryID : null;
      // insert a new Event into the DB using the provided info from the request body
      await pool.execute(
        'INSERT INTO Event (userID, created, name, description, location, date, startTime, endTime, categoryID) VALUES (?, UNIX_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?)',
        [req.id, req.body.name, description, location, req.body.date, req.body.startTime, endTime, categoryID]
      );
      // send back a '200' OK
      res.status(200).send();
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
      const [rows, _fields] = await pool.execute(`
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
      // insert a new category into the DB based on the info provided from the request's body
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

      const [rows, _fields] = await pool.execute(
        'SELECT senderID, recipientID FROM FriendRequest WHERE id = ?',
        [req.body.id]
      );
      const sender = rows[0].senderID;
      const recipient = rows[0].recipientID;
      await pool.execute(
        'DELETE FROM FriendRequest WHERE id = ?',
        [req.body.id]
      );
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
      const [rows, _fields] = await pool.execute(`
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
      // TODO: write this function
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
    // for now send back a 404 since this route isn't implemented
    res.status(404).send();
  },
  removeFriend: async (req, res) => {
    try {
      // TODO: write this function
    } catch (err) {
      // handle any other errors
      util.handleUncaughtError(err);
    }
    // for now send back a 404 since this route isn't implemented
    res.status(404).send();
  }
};
