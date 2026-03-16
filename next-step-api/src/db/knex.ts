import knex from 'knex'
import pg from 'pg'
import 'dotenv/config'
require('dotenv').config()

// Return DATE columns as plain YYYY-MM-DD strings instead of JS Date objects
// (which would be serialized to UTC ISO strings causing a day offset)
pg.types.setTypeParser(1082, (val: string) => val)

const environment = process.env.ENVIRONMENT || 'development'

export const db = knex({
  client: 'pg',
  connection: {
    connectionString: environment === 'development'
      ? process.env.DATABASE_URL_TEST
      : process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  pool: { min: 0, max: 10 },
})
