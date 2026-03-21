import type { RouteRecordRaw } from 'vue-router'
import { applicationsRoutes } from '@/modules/applications/routes'
import { jobsRoutes } from '@/modules/jobs/routes'
import { companiesRoutes } from '@/modules/companies/routes'
import { calendarRoutes } from '@/modules/calendar/routes'
import { settingsRoutes } from '@/modules/settings/routes'
import { authRoutes } from '@/modules/auth/routes'
import { adminRoutes } from '@/modules/admin/routes'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
        ...applicationsRoutes,
        ...jobsRoutes,
        ...companiesRoutes,
        ...calendarRoutes,
        ...settingsRoutes,
    ],
  },

  ...authRoutes,
  ...adminRoutes,

  // routes sans navbar
//   {
//     path: '/login',
//     component: () => import('@/layouts/AuthLayout.vue'),
//     children: [
//       {
//         path: '',
//         component: () => import('@/modules/auth/pages/Login.vue'),
//       },
//     ],
//   },

  // 404 (avec ou sans navbar selon ton choix)
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/NotFound.vue'),
  },
]
