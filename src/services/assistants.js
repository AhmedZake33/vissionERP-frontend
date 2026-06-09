import apiClient from './api'
import { preparePhonePayload } from '@/utils/phoneNumbers'

export default {
  getAssistants() {
    return apiClient.get('/assistants')
  },

  createAssistant(data) {
    return apiClient.post('/assistants', preparePhonePayload(data))
  },

  updateAssistant(id, data) {
    return apiClient.put(`/assistants/${id}`, preparePhonePayload(data))
  },

  deleteAssistant(id) {
    return apiClient.delete(`/assistants/${id}`)
  },
}
