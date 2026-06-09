import apiClient from './api'

export default {
  login(credentials) {
    return apiClient.post('/login', credentials)
  },
  
  register(userData) {
    return apiClient.post('/register', userData)
  },
  
  logout() {
    return apiClient.post('/logout')
  },
  
  getUser() {
    return apiClient.get('/me')
  },

  /**
   * Fetch the current user's Spatie roles & permissions.
   * Separate lightweight endpoint – call after login and on every page refresh.
   */
  getMyPermissions() {
    return apiClient.get('/my-permissions')
  },

  forgotPassword(data) {
    return apiClient.post('/forgot-password', data)
  },

  resetPassword(data) {
    return apiClient.post('/reset-password', data)
  },

  changePassword(data) {
    return apiClient.post('/change-password', data)
  },
}
