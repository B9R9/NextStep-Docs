/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasApplications = await knex.schema.hasTable('applications')
  if (!hasApplications) return

  const hasCompanyId = await knex.schema.hasColumn('applications', 'company_id')
  if (!hasCompanyId) {
    await knex.schema.alterTable('applications', (table) => {
      table.bigInteger('company_id').nullable()
    })

    await knex.schema.alterTable('applications', (table) => {
      table
        .foreign('company_id')
        .references('companies.id')
        .onDelete('SET NULL')
      table.index(['company_id'])
    })
  }
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  const hasApplications = await knex.schema.hasTable('applications')
  if (!hasApplications) return

  const hasCompanyId = await knex.schema.hasColumn('applications', 'company_id')
  if (!hasCompanyId) return

  await knex.schema.alterTable('applications', (table) => {
    table.dropColumn('company_id')
  })
}
