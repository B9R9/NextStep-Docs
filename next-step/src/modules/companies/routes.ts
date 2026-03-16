import type { RouteRecordRaw } from 'vue-router'

export const companiesRoutes: RouteRecordRaw[] = [
  {
    path: '/companies',
    name: 'companies.list',
    component: () => import('./components/CompaniesMainView.vue'),
  },
]
