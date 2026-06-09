import apiClient from './api'

export default {
  getAvailability(doctorId) {
    return apiClient.get(`/doctors/${doctorId}/availability`)
  },

  updateAvailability(doctorId, slots, slotDurationMinutes = 30) {
    return apiClient.put(`/doctors/${doctorId}/availability`, {
      slots,
      slot_duration_minutes: slotDurationMinutes,
    })
  },

  getHolidays(doctorId, params = {}) {
    return apiClient.get(`/doctors/${doctorId}/holidays`, { params })
  },

  addHoliday(doctorId, payload) {
    return apiClient.post(`/doctors/${doctorId}/holidays`, payload)
  },

  deleteHoliday(doctorId, holidayId) {
    return apiClient.delete(`/doctors/${doctorId}/holidays/${holidayId}`)
  },

  getAvailableTimes(doctorId, date) {
    return apiClient.get(`/doctors/${doctorId}/available-times`, { params: { date } })
  },
}
