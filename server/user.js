const _ = require('lodash');

module.exports = {
  // returns the details the authenticated user
  self: async (req, res) => {
    try {
      const [rows, _fields] = await connection.execute(
        'SELECT username, firstName, lastName, email, signUpDate from `UserDetails` INNER JOIN UserLogin ON UserDetails.userID=UserLogin.id WHERE id = ?', 
        [req.id]
      );
      res.status(200).send(rows[0]);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  events: async (req, res) => {
    try {
      const [rows, _fields] = await connection.execute(
        `SELECT Event.id, Event.created, Event.name, Event.description, Event.location, Event.date, Event.startTime, Event.endTime, Category.id as categoryID, Category.name as categoryName, Category.color as categoryColor
         FROM Event
         LEFT JOIN Category ON Event.categoryID = Category.id
         WHERE Event.userID = ?;`,
         [req.id]
      );
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
          category: {
            id: row.categoryID,
            name: row.categoryName,
            color: row.categoryColor
          }
        }
      }));
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  categories: async (req, res) => {
    try {
      const [rows, _fields] = await connection.execute(
        `SELECT id, name, color FROM Category WHERE userID = ?`,
        [req.id]
      );
      res.status(200).send(rows);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  friends: async (req, res) => {
    try {
      const [rows, _fields] = await connection.execute(
        'SELECT id, targetID, privacyType, tag FROM Friendship WHERE userID = ?',
        [req.id]
      );
      res.status(200).send(rows);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  availability: async (req, res) => {
    try {

    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
    res.status(404).send();
  },
  newEvent: async (req, res) => {
    try {
      const description = req.body.description ? req.body.description: null;
      const location = req.body.location ? req.body.location : null;
      const endTime = req.body.endTime ? req.body.endTime: null;
      const categoryID = req.body.categoryID ? req.body.categoryID: null;
      await connection.execute(
        'INSERT INTO Event (userID, created, name, description, location, date, startTime, endTime, categoryID) VALUES (?, UNIX_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?)',
        [req.id, req.body.name, description, location, req.body.date, req.body.startTime, endTime, categoryID]
      );
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  updateEvent: async (req, res) => {
    const description = req.body.description ? req.body.description: null;
    const location = req.body.location ? req.body.location : null;
    const endTime = req.body.endTime ? req.body.endTime: null;
    try {
      await connection.execute(
        'UPDATE Event SET name = ?, description = ?, location = ?, date = ?, startTime = ?, endTime = ? WHERE id = ?',
        [req.body.name, description, location, req.body.date, req.body.startTime, endTime, req.body.id]
      );
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  deleteEvent: async (req, res) => {
    try {
      await connection.execute(
        'DELETE FROM Event WHERE id = ?',
        [req.params.id]
      )
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  newCategory: async (req, res) => {
    try {
      await connection.execute(
        'INSERT INTO Category (userID, name, color) VALUES (?, ?, ?)',
        [req.id, req.body.name, req.body.color]
      );
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  updateCategory: async (req, res) => {
    try {
      await connection.execute(
        'UPDATE Category SET name = ?, color = ? WHERE id = ?',
        [req.body.name, req.body.color, req.body.id]
      );
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      await connection.execute(
        'UPDATE Event SET categoryID = null WHERE categoryID = ?',
        [req.params.id]
      );
      await connection.execute(
        'DELETE FROM Category WHERE id = ?',
        [req.params.id]
      );
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
  },
  addFriend: async (req, res) => {
    try {

    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
    res.status(404).send();
  },
  updateFriend: async (req, res) => {
    try {

    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
    res.status(404).send();
  },
  removeFriend: async (req, res) => {
    try {

    } catch (err) {
      console.log(err);
      res.status(500).send({ error: true, code: err.code, message: err.message });
    }
    res.status(404).send();
  }
};
