/**
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary()
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.string('token_hash', 64).notNullable().unique()
    table.timestamp('expires_at').notNullable()
    table.timestamp('revoked_at').nullable().defaultTo(null)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('refresh_tokens')
}
