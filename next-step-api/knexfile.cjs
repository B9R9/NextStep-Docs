require('dotenv').config()

const environment = process.env.ENVIRONMENT || 'development'
module.exports = {
  client: 'pg',
  connection: {
    connectionString: environment === 'development'
      ? process.env.DATABASE_URL_TEST
      : process.env.DATABASE_URL ,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    directory: './migrations',
  },
}
