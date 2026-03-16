/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('companies', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('user_id').notNullable()
    table
      .foreign('user_id')
      .references('users.id')
      .onDelete('CASCADE')

    table.string('name', 255).notNullable().defaultTo('')
    table.string('industry', 120).notNullable().defaultTo('')
    table.string('size', 50).notNullable().defaultTo('')
    table.string('location', 255).notNullable().defaultTo('')
    table.text('website').notNullable().defaultTo('')
    table.text('career_page').notNullable().defaultTo('')
    table.string('contactName', 255).notNullable().defaultTo('')
    table.string('contactEmail', 255).notNullable().defaultTo('')
    table.string('contactPhone', 80).notNullable().defaultTo('')
    table.text('socialMedia').notNullable().defaultTo('')
    table.text('comments').notNullable().defaultTo('')
    table.string('available_jobs', 80).notNullable().defaultTo('In progress')
    table.integer('total_applications').notNullable().defaultTo(0)
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    table.index(['user_id'])
    table.index(['user_id', 'name'])
  })
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('companies')
}
