"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Login from "@/components/auth/Login"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()

  const handleLogin = (password: string) => {
    const success = login(password)
    if (success) {
      // Redirecionar para dashboard após login bem-sucedido
      router.push("/dashboard")
    }
  }

  // Redirecionar se autenticado (deve estar antes dos returns condicionais)
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-400 font-light">Carregando...</div>
      </div>
    )
  }

  // Se não autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // Se autenticado, mostrar mensagem de redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-gray-400 font-light">Redirecionando...</div>
    </div>
  )
}
