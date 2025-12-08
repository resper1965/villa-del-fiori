"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api/client"
import { Lock } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await apiClient.post("/auth/login", { password })
      const { access_token, refresh_token } = response.data

      // Salvar tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)
        
        // Redirecionar para dashboard usando window.location para garantir
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      console.error("Login error:", err)
      const errorMessage = err.response?.data?.detail || err.message || "Erro ao fazer login. Verifique a senha e se o backend está rodando."
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Villa del Fiori
          </CardTitle>
          <CardDescription className="text-center">
            Gestão de Processos Condominiais
          </CardDescription>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Digite a senha para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                placeholder="Digite sua senha"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


