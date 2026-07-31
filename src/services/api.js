import axios from 'axios'

const api = axios.create({
  baseURL: window.CASHFLOW_API_URL || 'http://localhost:3000/api',
  timeout: 10000
})

// Interceptors: añadir token si corresponde
api.interceptors.request.use(config => {
  // config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api;