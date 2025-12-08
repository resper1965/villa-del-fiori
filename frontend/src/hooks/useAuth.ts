"use client"

import { useState, useEffect } from "react"

const AUTH_KEY = "villadelfiori_auth"
const CORRECT_PASSWORD = "cvdf2025"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Verificar sessionStorage
        const authStatus = sessionStorage.getItem(AUTH_KEY)
        if (authStatus === "true") {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (password: string): boolean => {
    // Validação de credenciais
    if (password === CORRECT_PASSWORD) {
      try {
        sessionStorage.setItem(AUTH_KEY, "true")
        setIsAuthenticated(true)
        return true
      } catch (error) {
        console.error("Erro ao salvar autenticação:", error)
        return false
      }
    }
    return false
  }

  const logout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}

