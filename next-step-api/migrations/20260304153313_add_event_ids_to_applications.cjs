
exports.up = function (knex) {
  return knex.schema.table('applications', (table) => {
    table.integer('applied_event_id').references('id').inTable('calendar_events').onDelete('SET NULL');
    table.integer('deadline_event_id').references('id').inTable('calendar_events').onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.table('applications', (table) => {
    table.dropColumn('applied_event_id');
    table.dropColumn('deadline_event_id');
  });
};