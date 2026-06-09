import apiClient from './api'

export default {
  getFinancials(params = {}) {
    return apiClient.get('/financials', { params })
  },

  getFinancial(id) {
    return apiClient.get(`/financials/${id}`)
  },

  getSummary(params = {}) {
    return apiClient.get('/financials/summary', { params })
  },

  createFinancial(data) {
    return apiClient.post('/financials', data)
  },

  updateFinancial(id, data) {
    return apiClient.put(`/financials/${id}`, data)
  },

  deleteFinancial(id) {
    return apiClient.delete(`/financials/${id}`)
  },

  // Transactions
  getAllTransactions(params = {}) {
    return apiClient.get('/transactions', { params })
  },

  getTransactions(financialId) {
    return apiClient.get(`/financials/${financialId}/transactions`)
  },

  createTransaction(financialId, data) {
    return apiClient.post(`/financials/${financialId}/transactions`, data)
  },

  createTransactionBatch(financialId, transactions) {
    return apiClient.post(`/financials/${financialId}/transactions/batch`, { transactions })
  },

  deleteTransaction(financialId, transactionId) {
    return apiClient.delete(`/financials/${financialId}/transactions/${transactionId}`)
  },
}
