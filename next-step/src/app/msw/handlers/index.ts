import { companiesHandlers } from './companies.handler'
import { jobsHandlers } from './jobs.handler'
import { locationsHandlers } from './locations.handler'
import { calendarHandlers } from './calendar.handler'
import { notificationsHandlers } from './notifications.handler'
// import { authHandlers } from './auth.handlers'

export const handlers = [
  ...companiesHandlers,
  ...jobsHandlers,
  ...locationsHandlers,
  ...calendarHandlers,
  ...notificationsHandlers,
  // ...authHandlers,
]
