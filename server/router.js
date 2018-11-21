const CONFIG = require('./config');
const tokenUtil = require('./token-util');
const auth = require('./auth');
const user = require('./user');
const express = require('express');
const mysql = require('mysql2');
const util = require('./util');

// creates an express router instance
const router = express.Router();

const startRoutes = async () => {
  // creates a pool of connections to the Database, using the config DB credentials supplied
  pool = mysql.createPool(CONFIG.dbCredentials).promise();

  // routes below are involved in auth (register, login, logout, tokenRefresh)
  router.post('/register', auth.register);

  router.post('/login', auth.login);

  router.post('/logout', auth.logout);

  router.post('/token', tokenUtil.refreshToken);

  // used to check the user's token for a valid auth for the rest of the routes below
  router.use(tokenUtil.checkToken);

  // anything below here requires a token to use
  // the user's ID is passed to req.id below here

  router.get('/self', user.self);

  router.get('/events', user.events);

  router.get('/categories', user.categories);

  router.post('/event', user.newEvent);
  router.put('/event', user.updateEvent);
  router.delete('/event/:id', user.deleteEvent);

  
  router.post('/category', user.newCategory);
  router.put('/category', user.updateCategory);
  router.delete('/category/:id', user.deleteCategory);
  
  // above is needed for DEMO-1
  // below is needed for DEMO-2
  
  // this will rely off query params for the start time & end time to return the friends available
  router.get('/availability', user.availability);

  router.post('/event/invite', user.eventInvite);
  router.post('/event/accept', user.acceptEventInvite);
  router.post('/event/deny', user.denyEventInvite);

  router.get('/fr-typeahead', util.getFriendRequestTypeAhead);

  router.get('/friend-requests', user.friendRequests);
  router.post('/friend-requests', user.sendFriendRequest);
  router.post('/friend-requests/accept', user.acceptFriendRequest);
  router.post('/friend-requests/deny', user.denyFriendRequest);
  
  router.get('/friends', user.friends);
  router.put('/friends', user.updateFriend);
  router.delete('/friends/:id', user.removeFriend);
};

// starts the router in an asynchronous fashion
startRoutes();

// exports the router
module.exports = router;
