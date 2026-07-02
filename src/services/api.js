import axios from 'axios'
import store from '@/store'

const shouldShowLoader = config => !config.hideGlobalLoader

const startLoading = config => {
  if (shouldShowLoader(config)) {
    config.__showGlobalLoader = true
    store.commit('app/START_API_LOADING')
  }
}

const stopLoading = config => {
  if (config && config.__showGlobalLoader) {
    store.commit('app/FINISH_API_LOADING')
  }
}

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
  config.headers = config.headers || {}
  startLoading(config)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers['Accept-Language'] = locale

  // Send socket ID so Laravel can exclude the current user from broadcasts
  if (window.Echo && window.Echo.socketId()) {
    config.headers['X-Socket-ID'] = window.Echo.socketId()
  }

  return config
}, error => {
  stopLoading(error.config)
  return Promise.reject(error)
})

// Handle 401 errors
apiClient.interceptors.response.use(
  response => {
    stopLoading(response.config)
    return response
  },
  error => {
    stopLoading(error.config || error.response?.config)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
