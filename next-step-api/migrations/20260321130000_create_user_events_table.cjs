/**
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('user_events', (table) => {
    table.bigIncrements('id').primary()
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.string('event', 80).notNullable()
    table.string('category', 40).notNullable()
    table.json('metadata').nullable()
    table.string('session_id', 36).nullable()
    table.string('ip', 45).nullable()
    table.string('user_agent', 500).nullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table.index(['user_id'])
    table.index(['event'])
    table.index(['category'])
    table.index(['created_at'])
    table.index(['user_id', 'created_at'])
    table.index(['session_id'])
  })
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('user_events')
}
