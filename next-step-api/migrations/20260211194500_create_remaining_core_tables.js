/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasJobs = await knex.schema.hasTable('jobs')
  if (!hasJobs) {
    await knex.schema.createTable('jobs', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('user_id').notNullable()
      table.bigInteger('company_id').nullable()
      // Kept for current backend search query compatibility.
      table.string('company', 255).notNullable().defaultTo('')
      table.string('position', 255).notNullable().defaultTo('')
      table.string('industry', 120).notNullable().defaultTo('')
      table.string('work_mode', 30).notNullable().defaultTo('')
      table.string('location', 255).notNullable().defaultTo('')
      table.string('contract', 30).notNullable().defaultTo('')
      table.string('level', 30).notNullable().defaultTo('')
      table.date('published_at').nullable()
      table.date('deadline_at').nullable()
      table.text('link').notNullable().defaultTo('')
      table.specificType('languages', 'text[]').notNullable().defaultTo('{}')
      table.text('description').notNullable().defaultTo('')
      table.text('requirements').notNullable().defaultTo('')
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

      table
        .foreign('user_id')
        .references('users.id')
        .onDelete('CASCADE')
      table
        .foreign('company_id')
        .references('companies.id')
        .onDelete('SET NULL')
      table.index(['user_id'])
      table.index(['user_id', 'company_id'])
    })
  }

  const hasApplications = await knex.schema.hasTable('applications')
  if (!hasApplications) {
    await knex.schema.createTable('applications', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('user_id').notNullable()
      table.bigInteger('jobId').nullable()
      table.bigInteger('company_id').nullable()
      // Used by current front type/search route.
      table.string('company', 255).notNullable().defaultTo('')
      table.string('type', 50).notNullable().defaultTo('CDI')
      table.string('position', 255).notNullable().defaultTo('')
      table.string('status', 50).notNullable().defaultTo('to_apply')
      table.date('applied').nullable()
      table.date('deadline').nullable()
      table.boolean('hasCV').notNullable().defaultTo(false)
      table.boolean('hasCL').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

      table
        .foreign('user_id')
        .references('users.id')
        .onDelete('CASCADE')
      table
        .foreign('jobId')
        .references('jobs.id')
        .onDelete('SET NULL')
      table
        .foreign('company_id')
        .references('companies.id')
        .onDelete('SET NULL')
      table.index(['user_id'])
      table.index(['user_id', 'status'])
      table.index(['jobId'])
      table.index(['company_id'])
    })
  }

  const hasCalendarEvents = await knex.schema.hasTable('calendar_events')
  if (!hasCalendarEvents) {
    await knex.schema.createTable('calendar_events', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('user_id').notNullable()
      table.string('type', 20).notNullable().defaultTo('event')
      table.date('date').notNullable()
      table.bigInteger('jobId').nullable()
      table.bigInteger('applicationId').nullable()
      table.string('position', 255).notNullable().defaultTo('')
      table.string('company', 255).notNullable().defaultTo('')
      table.string('title', 255).nullable()
      table.text('description').nullable()
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

      table
        .foreign('user_id')
        .references('users.id')
        .onDelete('CASCADE')
      table
        .foreign('jobId')
        .references('jobs.id')
        .onDelete('CASCADE')
      table
        .foreign('applicationId')
        .references('applications.id')
        .onDelete('CASCADE')
      table.index(['user_id'])
      table.index(['user_id', 'date'])
    })
  }

  const hasNotifications = await knex.schema.hasTable('notifications')
  if (!hasNotifications) {
    await knex.schema.createTable('notifications', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('user_id').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').notNullable()
      table.date('createdAt').notNullable()
      table.string('type', 20).nullable()
      table.boolean('dismissed').notNullable().defaultTo(false)

      table
        .foreign('user_id')
        .references('users.id')
        .onDelete('CASCADE')
      table.index(['user_id'])
      table.index(['user_id', 'dismissed'])
      table.index(['user_id', 'createdAt'])
    })
  }
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('notifications')
  await knex.schema.dropTableIfExists('calendar_events')
  await knex.schema.dropTableIfExists('applications')
  await knex.schema.dropTableIfExists('jobs')
}
