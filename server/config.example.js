module.exports = {
  production: false,
  dbCredentials: {
    host: '',
    user: '',
    password: '',
    database: '',
    connectTimeout: 1000000,
    connectionLimit: 100
  },
  port: 8080,
  tokenSecret: '',
  tokenLife: '10m',
  refreshTokenSecret: '',
  refreshTokenLife: '14d',
  saltRounds: 10
}
