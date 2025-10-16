import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"

import { storage } from "@/lib/storage"

const fallbackBaseUrl = "http://localhost:54321/api"

const baseURL = import.meta.env.VITE_API_URL ?? fallbackBaseUrl

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getToken()

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      storage.clearSession()
    }

    return Promise.reject(error)
  },
)
