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
      `)
  
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS UserDetails (
          userID int NOT NULL,
          firstName varchar(50) NOT NULL,
          lastName varchar(50) NOT NULL,
          email varchar(50) NOT NULL,
          signUpDate int NOT NULL,
          FOREIGN KEY (userID) REFERENCES UserLogin(id)
        )
      `)
  
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS TokenAuth (
          userID int NOT NULL,
          token varchar(256) NOT NULL
        )
      `)
    } catch (err) {
      console.log(err);
    }
    console.log('Finished Setup!');
  }
};
