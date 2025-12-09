"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Redirecionar baseado no status de autenticação
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-gray-400 font-light">Carregando...</div>
    </div>
  )
}
