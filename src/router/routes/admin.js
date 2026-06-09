export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/admin/dashboard.vue'),
    meta: {
      layout: 'content', // Vuexy’s main layout (with sidebar)
      requiresAuth: true,
      roles: ['admin'],
    },

  }
]
