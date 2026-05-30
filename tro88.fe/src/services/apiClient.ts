import axios from 'axios'

interface ApiEnvelope {
  success?: boolean
  message?: string
}

export const api = axios.create({
  baseURL: 'http://localhost:5073/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  console.log('[Tro88 API Request]', config.method?.toUpperCase(), config.url, config.params)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('[Tro88 API Response]', response.config.url, response.data)
    const data = response.data as ApiEnvelope
    if (data?.success === false) {
      return Promise.reject(new Error(data.message ?? 'API_ERROR'))
    }

    return response.data
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      console.error('[Tro88 API Error]', error.response?.status, error.response?.data)
      if (error.response?.status === 401) {
        const isLoginPage = window.location.pathname.startsWith('/login')
        if (!isLoginPage) {
          window.location.href = '/login/tenant'
        }
      }
    }

    return Promise.reject(error)
  },
)
