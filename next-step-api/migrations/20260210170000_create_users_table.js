/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary()
    table.string('email', 255).notNullable()
    table.string('password_hash', 255).notNullable()
    table.string('name', 255).notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
  })

  await knex.raw('CREATE UNIQUE INDEX users_email_unique_ci ON users (LOWER(email))')
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('users')
}
