import Vue from 'vue'
import Permission from './ability'

// Register a global method to check permissions
Vue.prototype.$can = function(action, resource) {
  return Permission(resource)
}

// Register a global method to check Spatie permissions
Vue.prototype.$hasPermission = function(permission) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return false
  // Removed: Admin bypass - now admins must have explicit permissions too
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')
  return permissions.includes(permission)
}

// Check if user has any of the given permissions
Vue.prototype.$hasAnyPermission = function(permissions) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return false
  // Removed: Admin bypass - now admins must have explicit permissions too
  const userPerms = JSON.parse(localStorage.getItem('permissions') || '[]')
  return permissions.some(p => userPerms.includes(p))
}
