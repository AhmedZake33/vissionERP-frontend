import axios from 'axios'

const apiClient = axios.create({
  baseURL: `${process.env.VUE_APP_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add auth token and socket ID to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  const locale = localStorage.getItem('locale') || 'en'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers['Accept-Language'] = locale

  // Send socket ID so Laravel can exclude the current user from broadcasts
  if (window.Echo && window.Echo.socketId()) {
    config.headers['X-Socket-ID'] = window.Echo.socketId()
  }

  return config
})

// Handle 401 errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
