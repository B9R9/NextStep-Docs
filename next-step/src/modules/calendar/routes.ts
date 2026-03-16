import type { RouteRecordRaw } from 'vue-router'

export const calendarRoutes: RouteRecordRaw[] = [
  {
    path: '/calendar',
    name: 'calendar.main',
    component: () => import('./components/CalendarMainView.vue'),
  },
]
