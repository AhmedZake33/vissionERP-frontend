import Vue from 'vue'
import VueRouter from 'vue-router'

// Routes
import apps from './routes/apps'
import welcome from './routes/welcome'
import admin from './routes/admin'
import teacher from './routes/teacher'
import student from './routes/student'
import clinic from './routes/clinic'
import erp from './routes/erp'
import uiElements from './routes/ui-elements/index'
import pages from './routes/pages'
import chartsMaps from './routes/charts-maps'
import formsTable from './routes/forms-tables'
import others from './routes/others'
import { erpHomeRouteNameForPermissions, hasErpPermission } from '@/utils/erpHomeRoute'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  /**
   * FIX: Do NOT use VUE_APP_BASE_URL here. 
   * VUE_APP_BASE_URL is for your API (https://...).
   * 'base' should be the subdirectory of your frontend (usually '/' or process.env.BASE_URL).
   */
  base: process.env.BASE_URL || '/', 
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    { path: '/', redirect: { name: 'login' } },
    ...apps,
    ...welcome,
    ...admin,
    ...teacher,
    ...student,
    ...clinic,
    ...erp,
    ...pages,
    ...chartsMaps,
    ...formsTable,
    ...uiElements,
    ...others,
    {
      path: '*',
      redirect: 'error-404',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // Redirect to login if not authenticated and route requires auth
  if (!token && to.meta.requiresAuth) {
    return next({ name: 'login' })
  }

  // Helper: get the home route name for a given role
  const homeForRole = role => {
    if (role === 'super_admin') return 'super-admin-dashboard'
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')
    if (hasErpPermission(permissions)) return erpHomeRouteNameForPermissions(permissions)
    if (role === 'doctor') return 'doctor-dashboard'
    if (role === 'assistant') return 'assistant-dashboard'
    if (role === 'sub-doctor') return 'doctor-reservations'
    return 'dashboard'
  }

  // Redirect to role-specific home if already logged in and trying to access login
  if (token && to.name === 'login') {
    return next({ name: homeForRole(user && user.role) })
  }

  if (to.meta.roles && (!user || !to.meta.roles.includes(user.role))) {
    return next({ name: 'error-404' })
  }

  // Check permission-based access
  if (to.meta.permissions && user) {
    const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]')
    const role = user.role || ''

    // Admin bypasses all permission checks
    if (!['admin', 'super_admin', 'company_owner'].includes(role) && !(to.meta.ownerAccess && role === 'company_owner')) {
      const requiredPerms = to.meta.permissions
      const hasPermission = requiredPerms.some(p => userPermissions.includes(p))

      if (!hasPermission) {
        return next({ name: 'error-404' })
      }
    }
  }

  return next()
})

router.afterEach(() => {
  // Remove initial loading splash screen
  const appLoading = document.getElementById('loading-bg')
  if (appLoading) {
    appLoading.style.display = 'none'
  }
})

export default router
