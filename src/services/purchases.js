import apiClient from './api'

export default {
  getPurchases(params = {}) {
    return apiClient.get('/purchases', { params })
  },

  getPurchase(id) {
    return apiClient.get(`/purchases/${id}`)
  },

  createPurchase(data) {
    return apiClient.post('/purchases', data)
  },

  updatePurchase(id, data) {
    return apiClient.put(`/purchases/${id}`, data)
  },

  deletePurchase(id) {
    return apiClient.delete(`/purchases/${id}`)
  },
  // stats: unified endpoint (POST for filters/range)
  stats(payload = {}) {
    console.log('Fetching stats with payload:', payload)
    return apiClient.post('/purchases/stats', payload)
  },
}
