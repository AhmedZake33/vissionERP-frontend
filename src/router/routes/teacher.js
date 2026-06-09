export default [
  {
    path: '/teacher',
    name: 'teacher',
    component: () => import('@/views/teacher/teacher.vue'),
    meta: {
      layout: 'content',
      requiresAuth: true,
      roles: ['teacher'],
    },
  },
  {
    path: '/years',
    name: 'years',
    component: () => import('@/views/years/years.vue'),
    meta: {
      layout: 'content',
      requiresAuth: true,
      roles: ['teacher'],
    },
  },
]
