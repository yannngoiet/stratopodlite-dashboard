import axios, { AxiosInstance } from 'axios'

const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true  // sends HttpOnly cookies automatically
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/auth/sign-in'
    }
    return Promise.reject(error)
  }
)

export default httpClient