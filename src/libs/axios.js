// src/libs/axios.js
import axios from 'axios'
import router from '@/router'
import store from '@/store'

const api = axios.create({
  baseURL: `${process.env.VUE_APP_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

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

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  const locale = localStorage.getItem('locale') || 'en'
  cfg.headers = cfg.headers || {}
  startLoading(cfg)

  if (token) cfg.headers.Authorization = `Bearer ${token}`
  cfg.headers['Accept-Language'] = locale

  // Send socket ID so Laravel can exclude the current user from broadcasts
  if (window.Echo && window.Echo.socketId()) {
    cfg.headers['X-Socket-ID'] = window.Echo.socketId()
  }

  return cfg
}, err => {
  stopLoading(err.config)
  return Promise.reject(err)
})

api.interceptors.response.use(
  res => {
    stopLoading(res.config)
    return res
  },
  err => {
    stopLoading(err.config || err.response?.config)
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.replace({ name: 'login' }).catch(()=>{})
    }
    return Promise.reject(err)
  }
)

export default api
