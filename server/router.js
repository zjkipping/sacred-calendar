const CONFIG = require('./config');
const tokenUtil = require('./token-util');
const auth = require('./auth');
const user = require('./user');
const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const startRoutes = async () => {
  connection = await mysql.createConnection(CONFIG.dbCredentials);

  router.post('/register', auth.register);

  router.post('/login', auth.login);

  router.post('/logout', auth.logout);

  router.post('/token', tokenUtil.refreshToken);

  router.use(tokenUtil.checkToken);
  // anything below here requires a token to use
  // the user's ID is passed to req.id below here

  router.get('/self', user.self);

  router.get('/events', user.events);

  router.get('/categories', user.categories);

  router.post('/event', user.newEvent);
  router.put('/event', user.updateEvent);
  router.delete('/event', user.deleteEvent);

  router.post('/category', user.newCategory);
  router.put('/category', user.updateCategory);
  router.delete('/category', user.deleteCategory);

  // above is needed for DEMO-1
  // below is needed for DEMO-2

  router.get('/availability', user.availability);
  router.get('/friends', user.friends);

  router.post('/friends', user.addFriend);
  router.put('/friends', user.updateFriend);
  router.delete('/friends', user.removeFriend);

};

startRoutes();

module.exports = router;
