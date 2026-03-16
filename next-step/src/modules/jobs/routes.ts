import type { RouteRecordRaw } from 'vue-router'

export const jobsRoutes: RouteRecordRaw[] = [
  {
    path: '/jobs',
    name: 'jobs.list',
    component: () => import('./components/JobsMainView.vue'),
  },
]
