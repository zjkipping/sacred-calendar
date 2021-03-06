const CONFIG = require('./config');
const mysql = require('mysql2/promise');

module.exports = { 
  setup: async () => {
    try {
      // creates a one-time connection to the DB
      const connection = await mysql.createConnection(CONFIG.dbCredentials);
  
      // creates the UserLogin table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS UserLogin (
          id int AUTO_INCREMENT PRIMARY KEY,
          username varchar(30) NOT NULL UNIQUE,
          password varchar(256) NOT NULL
        )
      `);
          
      // creates the UserDetails table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS UserDetails (
          userID int NOT NULL,
          firstName varchar(50) NOT NULL,
          lastName varchar(50) NOT NULL,
          email varchar(50) NOT NULL UNIQUE,
          signUpDate int NOT NULL,
          FOREIGN KEY (userID) REFERENCES UserLogin(id)
        )
      `);
  
      // creates the TokenAuth table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS TokenAuth (
          id int AUTO_INCREMENT PRIMARY KEY,
          userID int NOT NULL,
          token varchar(256)
        )
      `);

      // creates the Category table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Category (
          id int AUTO_INCREMENT PRIMARY KEY,
          userID int NOT NULL,
          name varchar(50) NOT NULL,
          color varchar(7) NOT NULL,
          FOREIGN KEY (userID) REFERENCES UserLogin(id)
        )
      `);

      // creates the Event table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Event (
          id int AUTO_INCREMENT PRIMARY KEY,
          userID int NOT NULL,
          categoryID int,
          created int NOT NULL,
          name varchar(50) NOT NULL,
          description text,
          location varchar(255),
          date int NOT NULL,
          startTime int NOT NULL,
          endTime int,
          FOREIGN KEY (userID) REFERENCES UserLogin(id),
          FOREIGN KEY (categoryID) REFERENCES Category(id)
        )
      `);

      // creates the Friendship table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Friendship (
          id int AUTO_INCREMENT PRIMARY KEY,
          userID int NOT NULL,
          targetID int NOT NULL,
          privacyType int NOT NULL DEFAULT 0,
          tag varchar(25),
          FOREIGN KEY (userID) REFERENCES UserLogin(id)
        )
      `);

      // creates the FriendRequest table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS FriendRequest (
          id int AUTO_INCREMENT PRIMARY KEY,
          senderID int NOT NULL,
          recipientID int NOT NULL,
          created int NOT NULL
        )
      `);

      // creates the EventInvite table in the DB
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS EventInvite (
          id int AUTO_INCREMENT PRIMARY KEY,
          senderID int NOT NULL,
          recipientID int NOT NULL,
          eventID int NOT NULL,
          created int NOT NULL,
          FOREIGN KEY (eventID) REFERENCES Event (id)
        )
      `);
      connection.end();
    } catch (err) {
      console.log(err);
    }
    console.log('Finished Setup!');
    // if the system isn't in production full exit the program, otherwise let it continue
    if (!CONFIG.production) {
      process.exit(0);
    }
  }
};
