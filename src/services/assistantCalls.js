import apiClient from './api'

export default {
  /**
   * Create a new assistant call (doctor only)
   */
  createCall(data = {}) {
    return apiClient.post('/assistant-calls', data)
  },

  /**
   * Get active (pending / accepted) calls
   */
  getActiveCalls() {
    return apiClient.get('/assistant-calls/active')
  },

  /**
   * Accept a pending call (assistant only)
   */
  acceptCall(callId) {
    return apiClient.post(`/assistant-calls/${callId}/accept`)
  },

  /**
   * Mark a call as done
   */
  completeCall(callId) {
    return apiClient.post(`/assistant-calls/${callId}/complete`)
  },
}
