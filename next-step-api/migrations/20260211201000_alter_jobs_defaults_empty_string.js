/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasJobs = await knex.schema.hasTable('jobs')
  if (!hasJobs) return

  await knex.schema.alterTable('jobs', (table) => {
    table.string('work_mode', 30).notNullable().defaultTo('').alter()
    table.string('contract', 30).notNullable().defaultTo('').alter()
    table.string('level', 30).notNullable().defaultTo('').alter()
  })
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  const hasJobs = await knex.schema.hasTable('jobs')
  if (!hasJobs) return

  await knex.schema.alterTable('jobs', (table) => {
    table.string('work_mode', 30).notNullable().defaultTo('onsite').alter()
    table.string('contract', 30).notNullable().defaultTo('full_time').alter()
    table.string('level', 30).notNullable().defaultTo('mid').alter()
  })
}
