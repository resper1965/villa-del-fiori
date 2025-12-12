"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Redirecionar baseado no status de autenticação
  useEffect(() => {
    // Timeout de segurança: se isLoading ficar true por mais de 5 segundos, forçar redirecionamento
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.warn("Home page: isLoading stuck, forcing redirect to login")
        router.push("/login")
      }, 5000)

      return () => clearTimeout(timeoutId)
    }

    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <div className="text-gray-400 font-light">Carregando...</div>
        <div className="text-xs text-gray-500">Se demorar, tente recarregar a página</div>
      </div>
    </div>
  )
}
