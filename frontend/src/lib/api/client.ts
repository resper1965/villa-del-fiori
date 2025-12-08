import axios from "axios"

// Detectar URL da API automaticamente
const getApiUrl = () => {
  // Se estiver definida via variável de ambiente, usar
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Se estiver em produção (Vercel), usar URL relativa
  if (typeof window !== "undefined") {
    // Em produção na Vercel, usar URL relativa
    if (window.location.hostname !== "localhost") {
      return "/api/v1"
    }
  }
  
  // Desenvolvimento local
  return "http://localhost:8000/api/v1"
}

const API_URL = getApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

