import api from './api'

export default {
  statistics: () => api.get('/super-admin/statistics'),
  list: (params = {}) => api.get('/super-admin/companies', { params }),
  get: id => api.get(`/super-admin/companies/${id}`),
  create: data => api.post('/super-admin/companies', data),
  update: (id, data) => api.put(`/super-admin/companies/${id}`, data),
  setStatus: (id, status) => api.patch(`/super-admin/companies/${id}/status`, { status }),
  remove: id => api.delete(`/super-admin/companies/${id}`),
}
