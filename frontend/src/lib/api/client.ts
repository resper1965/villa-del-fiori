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
      return "/v1"
    }
  }
  
  // Desenvolvimento local
  return "http://localhost:8000/v1"
}

const API_URL = getApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    console.error("API Error:", error)
    return Promise.reject(error)
  }
)

