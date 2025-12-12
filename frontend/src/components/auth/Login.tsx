"use client"

import { useState, FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Building2 } from "lucide-react"

interface LoginProps {
  onLogin: (password: string) => void
}

const CORRECT_PASSWORD = "cvdf2025" // Senha hardcoded conforme especificação

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validação de campo vazio
    if (!password.trim()) {
      setError("Por favor, insira a senha")
      setIsLoading(false)
      return
    }

    // Simular pequeno delay para melhor UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Validação de credenciais (comparação de string simples)
    if (password === CORRECT_PASSWORD) {
      onLogin(password)
      setPassword("")
    } else {
      setError("Senha incorreta")
      setPassword("")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-card/50 border-border/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Building2 className="h-6 w-6 text-white stroke-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-light text-foreground">
            Gabi
          </CardTitle>
          <CardDescription className="text-muted-foreground font-light">
            Síndica Virtual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-light">
                Senha de Acesso
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-1" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-light">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-[#0099cc] text-white font-light"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

