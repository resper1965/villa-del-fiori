"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Timeout de segurança (30 segundos)
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError("Tempo de espera excedido. Tente novamente.")
    }, 30000)

    try {
      const success = await login(email, password)
      clearTimeout(timeoutId)

      if (success) {
        // Usar replace para evitar loop de navegação
        router.replace("/dashboard")
      } else {
        setError("Credenciais inválidas. Verifique seu email e senha.")
        setLoading(false)
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error("Login error:", err)
      let errorMessage = "Erro ao fazer login. Tente novamente."
      
      if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão."
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <Image
              src="/logo.png"
              alt="Gabi - Síndica Virtual"
              width={200}
              height={80}
              className="h-auto w-auto max-w-[200px]"
              priority
            />
          </div>
          <p className="text-muted-foreground font-light text-sm">Síndica Virtual</p>
          <p className="text-sm text-muted-foreground mt-2">
            Entre com seu email para acessar sua conta
          </p>
        </div>

        {/* Card de Login */}
        <div className="w-full max-w-md bg-card/90 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-light">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-1" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoFocus
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-light">Senha</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-1" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-light">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-[#0099cc] text-white font-light"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/50 px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Link para Registro */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  )
}
