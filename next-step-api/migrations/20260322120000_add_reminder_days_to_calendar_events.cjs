exports.up = function (knex) {
  return knex.schema.alterTable('calendar_events', (table) => {
    // Per-event reminder_days (JSON array). Only set on manually created events.
    // Auto-created events (jobId / applicationId set) use the global user reminder_days.
    table.text('reminder_days').nullable().defaultTo(null)
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('calendar_events', (table) => {
    table.dropColumn('reminder_days')
  })
}
