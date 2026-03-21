/**
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('user_feedback', (table) => {
    table.increments('id').primary()
    table.integer('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
    table.string('subject', 40).notNullable()
    table.text('message').notNullable()
    table.boolean('is_anonymous').notNullable().defaultTo(true)
    table.string('email', 255).nullable() // filled when not anonymous
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table.index(['subject'])
    table.index(['created_at'])
    table.index(['is_anonymous'])
  })
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('user_feedback')
}
