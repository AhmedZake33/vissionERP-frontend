import Vue from 'vue'

/**
 * v-permission directive
 * Usage:
 *   v-permission="'view-clients'"          - single permission
 *   v-permission="['view-clients', 'edit-clients']" - any of these permissions
 *
 * Elements without the required permission will be removed from DOM.
 */
Vue.directive('permission', {
  inserted(el, binding) {
    const value = binding.value
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    if (!user) {
      el.parentNode && el.parentNode.removeChild(el)
      return
    }

    // Removed: Admin bypass - now admins must have explicit permissions too

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')

    let hasPermission = false
    if (Array.isArray(value)) {
      hasPermission = value.some(p => permissions.includes(p))
    } else {
      hasPermission = permissions.includes(value)
    }

    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  },
})
