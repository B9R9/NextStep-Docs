import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'admin.dashboard',
    component: () => import('./pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]
