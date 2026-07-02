import api from './api'

const resource = path => ({
  list: (params = {}) => api.get(`/erp/${path}`, { params }),
  get: id => api.get(`/erp/${path}/${id}`),
  create: data => api.post(`/erp/${path}`, data),
  update: (id, data) => api.put(`/erp/${path}/${id}`, data),
  remove: id => api.delete(`/erp/${path}/${id}`),
})

export default {
  categories: resource('categories'),
  products: resource('products'),
  customers: {
    ...resource('customers'),
    invoices: (id, params = {}) => api.get(`/erp/customers/${id}/invoices`, { params }),
  },
  suppliers: resource('suppliers'),
  rawMaterials: resource('raw-materials'),
  rawMaterialPurchases: {
    ...resource('raw-material-purchases'),
    payments: id => api.get(`/erp/raw-material-purchases/${id}/payments`),
    pay: (id, data) => api.post(`/erp/raw-material-purchases/${id}/payments`, data),
    deletePayment: (invoiceId, paymentId) => api.delete(`/erp/raw-material-purchases/${invoiceId}/payments/${paymentId}`),
  },
  rawMaterialPayments: {
    list: (params = {}) => api.get('/erp/raw-material-purchase-payments', { params }),
  },
  rawMaterialMovements: {
    list: (params = {}) => api.get('/erp/raw-material-movements', { params }),
    create: data => api.post('/erp/raw-material-movements', data),
  },
  invoices: {
    ...resource('invoices'),
    print: id => api.get(`/erp/invoices/${id}/print`),
    payments: id => api.get(`/erp/invoices/${id}/payments`),
    pay: (id, data) => api.post(`/erp/invoices/${id}/payments`, data),
    return: (id, data) => api.post(`/erp/invoices/${id}/returns`, data),
    deletePayment: (invoiceId, paymentId) => api.delete(`/erp/invoices/${invoiceId}/payments/${paymentId}`),
  },
  invoiceReturns: {
    list: (params = {}) => api.get('/erp/invoice-returns', { params }),
    get: id => api.get(`/erp/invoice-returns/${id}`),
    remove: id => api.delete(`/erp/invoice-returns/${id}`),
  },
  stockMovements: {
    list: (params = {}) => api.get('/erp/stock-movements', { params }),
    create: data => api.post('/erp/stock-movements', data),
    lowStock: () => api.get('/erp/inventory/low-stock'),
  },
  operations: {
    list: (params = {}) => api.get('/erp/operations', { params }),
  },
  payments: {
    list: (params = {}) => api.get('/erp/invoice-payments', { params }),
  },
  expenses: resource('expenses'),
  employees: resource('employees'),
  salaries: resource('salaries'),
  reports: {
    summary: (params = {}) => api.get('/erp/reports/summary', { params }),
  },
}
