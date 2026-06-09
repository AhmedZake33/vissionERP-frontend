export default [
  {
    path: '/student',
    name: 'student',
    component: () => import('@/views/student/student.vue'),
    meta: {
      layout: 'content',
      requiresAuth: true,
      roles: ['student'],
    },

  }
]
