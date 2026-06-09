// src/libs/axios.js
import axios from 'axios'
import router from '@/router'

const api = axios.create({ baseURL: `${process.env.VUE_APP_BASE_URL}` })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`

  // Send socket ID so Laravel can exclude the current user from broadcasts
  if (window.Echo && window.Echo.socketId()) {
    cfg.headers['X-Socket-ID'] = window.Echo.socketId()
  }

  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.replace({ name: 'login' }).catch(()=>{})
    }
    return Promise.reject(err)
  }
)

export default api
