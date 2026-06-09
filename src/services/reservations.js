import apiClient from './api'

export default {
  getReservations(params = {}) {
    return apiClient.get('/reservations', { params })
  },
  
  getReservation(id) {
    return apiClient.get(`/reservations/${id}`)
  },
  
  createReservation(reservationData) {
    return apiClient.post('/reservations', reservationData)
  },
  
  updateReservation(id, reservationData) {
    return apiClient.put(`/reservations/${id}`, reservationData)
  },
  
  completeReservation(id, data) {
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined

    return apiClient.post(`/reservations/${id}/complete`, data, config)
  },

  downloadArchiveFile(id) {
    return apiClient.get(`/archive/download/${id}`, {
      responseType: 'blob',
    })
  },

  previewArchiveFile(id) {
    return apiClient.get(`/archive/preview/${id}`, {
      responseType: 'blob',
    })
  },

  confirmReservation(id) {
    return apiClient.post(`/reservations/${id}/confirm`)
  },
  
  generatePrescription(id) {
    return apiClient.get(`/reservations/${id}/prescription`, {
      responseType: 'blob'
    })
  },

  generateMedicinesPrescription(id) {
    return apiClient.get(`/reservations/${id}/medicines-prescription`, {
      responseType: 'blob'
    })
  },

  generateReservationDetailsPdf(id) {
    return apiClient.get(`/reservations/${id}/details-pdf`, {
      responseType: 'blob'
    })
  },
  
  deleteReservation(id) {
    return apiClient.delete(`/reservations/${id}`)
  },
  
  getDoctors() {
    return apiClient.get('/doctors')
  },

  // Check-in & Waiting Queue
  checkIn(id) {
    return apiClient.post(`/reservations/${id}/check-in`)
  },

  undoCheckIn(id) {
    return apiClient.post(`/reservations/${id}/undo-check-in`)
  },

  getWaitingQueue(params = {}) {
    return apiClient.get('/waiting-queue', { params })
  },

  getQueueSummary(params = {}) {
    return apiClient.get('/waiting-queue/summary', { params })
  },

  reorderWaitingQueue(orderedIds = []) {
    return apiClient.post('/waiting-queue/reorder', { ordered_ids: orderedIds })
  }
}
