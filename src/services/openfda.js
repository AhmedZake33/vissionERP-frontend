import apiClient from './api'

export default {
  // OpenFDA (international drugs)
  searchDrugs(query, limit = 10) {
    return apiClient.get('/openfda/drugs', {
      params: { query, limit },
    })
  },

  getDrugDetails(name) {
    return apiClient.get('/openfda/drug-details', {
      params: { name },
    })
  },

  // Egypt drug database
  searchEgyptDrugs(query, { category, form, limit } = {}) {
    return apiClient.get('/egypt-drugs/search', {
      params: { query, category, form, limit },
    })
  },

  getEgyptDrugFilters() {
    return apiClient.get('/egypt-drugs/filters')
  },
}
