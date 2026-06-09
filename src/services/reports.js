import apiClient from './api'

export default {
  getSummary(params = {}) {
    return apiClient.get('/reports/summary', { params })
  },

  exportPdf(params = {}) {
    return apiClient.get('/reports/pdf', {
      params,
      responseType: 'blob',
    })
  },
}
