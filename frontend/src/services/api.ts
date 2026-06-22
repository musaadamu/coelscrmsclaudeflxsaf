import axios, { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:4000/api',
  timeout: 30000,
})

// Request interceptor: attach bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: silent refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const { data } = await axios.post(
            `${process.env.API_URL || 'http://localhost:4000/api'}/auth/refresh`,
            { refreshToken }
          )

          localStorage.setItem('accessToken', data.data.accessToken)
          api.defaults.headers.Authorization = `Bearer ${data.data.accessToken}`

          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
