import axios from 'axios'

interface ApiEnvelope {
  success?: boolean
  message?: string
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5073/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

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
  async (error: any) => {
    const originalRequest = error.config

    if (axios.isAxiosError(error)) {
      console.error('[Tro88 API Error]', error.response?.status, error.response?.data)
      if (error.response?.status === 401 && !originalRequest._retry) {
        const refreshToken = localStorage.getItem('refreshToken')
        const isLoginPage = window.location.pathname.startsWith('/login')

        if (refreshToken && !isLoginPage) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return api(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          isRefreshing = true

          try {
            const refreshRes = await axios.post(`${baseURL}/Auth/refresh-token`, {
              refreshToken,
            })

            const responseData = refreshRes.data
            if (responseData && responseData.success && responseData.data) {
              const { accessToken, refreshToken: newRefreshToken } = responseData.data
              localStorage.setItem('accessToken', accessToken)
              localStorage.setItem('refreshToken', newRefreshToken)

              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              processQueue(null, accessToken)
              isRefreshing = false

              return api(originalRequest)
            }
          } catch (refreshError) {
            processQueue(refreshError, null)
            isRefreshing = false

            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('authUserId')
            localStorage.removeItem('authFullName')
            localStorage.removeItem('authEmail')
            localStorage.removeItem('authRole')

            window.location.href = '/login/tenant'
            return Promise.reject(refreshError)
          }
        } else if (!isLoginPage) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('authUserId')
          localStorage.removeItem('authFullName')
          localStorage.removeItem('authEmail')
          localStorage.removeItem('authRole')
          window.location.href = '/login/tenant'
        }
      }
    }

    return Promise.reject(error)
  },
)
