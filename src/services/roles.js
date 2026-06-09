import axios from '@axios'

export default {
  // Roles
  getRoles() {
    return axios.get('/roles')
  },

  getRole(roleId) {
    return axios.get(`/roles/${roleId}`)
  },

  createRole(data) {
    return axios.post('/roles', data)
  },

  updateRole(roleId, data) {
    return axios.put(`/roles/${roleId}`, data)
  },

  deleteRole(roleId) {
    return axios.delete(`/roles/${roleId}`)
  },

  // Permissions
  getPermissions(grouped = false) {
    const params = grouped ? { grouped: 1 } : {}
    return axios.get('/permissions', { params })
  },

  createPermission(data) {
    return axios.post('/permissions', data)
  },

  deletePermission(permissionId) {
    return axios.delete(`/permissions/${permissionId}`)
  },

  // Assign role to user
  assignRole(userId, role) {
    return axios.post(`/users/${userId}/assign-role`, { role })
  },
}
