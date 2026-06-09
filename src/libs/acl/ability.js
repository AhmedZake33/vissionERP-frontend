import store from '@/store'

export default function Permission(resource) {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  if (!user) {
    return false
  }
  
  // If no resource specified or resource is 'all', allow access
  if (!resource || resource === 'all' || resource === 'Auth') {
    return true
  }

  // Admin has access to everything
  if (user.role === 'admin') {
    return true
  }

  // Check Spatie permission-based access only
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]')
  return permissions.includes(resource)
}
