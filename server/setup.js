const CONFIG = require('./config');
const mysql = require('mysql2/promise');

module.exports = { 
  setup: async () => {
    try {
      const connection = await mysql.createConnection(CONFIG.dbCredentials);
  
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS UserLogin (
          id int AUTO_INCREMENT PRIMARY KEY,
          username varchar(30) NOT NULL UNIQUE,
          password varchar(256) NOT NULL
        )
      `);
  
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
  
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS TokenAuth (
          userID int NOT NULL,
          token varchar(256) NOT NULL
        )
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Category (
          id int AUTO_INCREMENT PRIMARY KEY,
          userID int NOT NULL,
          name varchar(50) NOT NULL UNIQUE,
          color varchar(7) NOT NULL,
          FOREIGN KEY (userID) REFERENCES UserLogin(id)
        )
      `);

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Event (
          id int AUTO_INCREMENT PRIMARY KEY,
          userID int NOT NULL,
          categoryID int,
          created int NOT NULL,
          name varchar(50) NOT NULL,
          description text,
          location varchar(255),
          date varchar(10) NOT NULL,
          startTime varchar(25) NOT NULL,
          endTime varchar(25),
          FOREIGN KEY (userID) REFERENCES UserLogin(id),
          FOREIGN KEY (categoryID) REFERENCES Category(id)
        )
      `);

      // kinda depressing...
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

      await connection.execute(`
        CREATE TABLE IF NOT EXISTS FriendRequest (
          id int AUTO_INCREMENT PRIMARY KEY,
          senderID int NOT NULL,
          recipientID int NOT NULL,
          created int NOT NULL
        )
      `);

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
    } catch (err) {
      console.log(err);
    }
    console.log('Finished Setup!');
    if (!process.env.NODE_ENV.includes('prod')) {
      process.exit(0);
    }
  }
};
