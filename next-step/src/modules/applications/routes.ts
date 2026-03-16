import type { RouteRecordRaw } from 'vue-router'

export const applicationsRoutes: RouteRecordRaw[] = [
  {
    path: '/applications',
    name: 'applications.list',
    component: () => import('@/modules/applications/components/ApplicationsMainView.vue'),
    meta: { requiresAuth: true },
  },
//   {
//     path: '/applications/:id',
//     name: 'applications.detail',
//     component: () => import(''),
//     meta: { requiresAuth: true },
//     props: true,
//   },
]
