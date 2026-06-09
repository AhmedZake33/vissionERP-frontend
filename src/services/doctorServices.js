import axios from '@axios'

export default {
  // Doctor services catalog
  getAll() {
    return axios.get('/doctor-services')
  },
  getAllForReservation(reservationId) {
    return axios.get(`/reservations/${reservationId}/doctor-services`)
  },
  getAllForDoctor(doctorId) {
    return axios.get(`/doctors/${doctorId}/doctor-services`)
  },
  create(data) {
    return axios.post('/doctor-services', data)
  },
  update(id, data) {
    return axios.put(`/doctor-services/${id}`, data)
  },
  delete(id) {
    return axios.delete(`/doctor-services/${id}`)
  },

  // Reservation services
  getReservationServices(reservationId) {
    return axios.get(`/reservations/${reservationId}/services`)
  },
  addToReservation(reservationId, data) {
    return axios.post(`/reservations/${reservationId}/services`, data)
  },
  updateReservationService(reservationId, serviceId, data) {
    return axios.put(`/reservations/${reservationId}/services/${serviceId}`, data)
  },
  deleteReservationService(reservationId, serviceId) {
    return axios.delete(`/reservations/${reservationId}/services/${serviceId}`)
  },
}
