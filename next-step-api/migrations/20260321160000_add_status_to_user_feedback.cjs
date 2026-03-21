/**
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
  return knex.schema.alterTable('user_feedback', (table) => {
    table.string('status', 20).notNullable().defaultTo('new') // new | in_progress | archived
    table.string('ticket_number', 50).nullable()
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    table.index(['status'])
  })
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = function (knex) {
  return knex.schema.alterTable('user_feedback', (table) => {
    table.dropColumn('status')
    table.dropColumn('ticket_number')
    table.dropColumn('updated_at')
  })
}
