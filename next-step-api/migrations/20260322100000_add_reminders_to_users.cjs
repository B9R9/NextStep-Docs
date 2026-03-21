exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.boolean('reminders_enabled').notNullable().defaultTo(false)
    table.text('reminder_days').nullable().defaultTo(null)
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('reminders_enabled')
    table.dropColumn('reminder_days')
  })
}
