"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldX, LogOut, Home } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleGoHome = () => {
    router.push("/dashboard")
  }

  // Se o usuário não estiver autenticado, redirecionar para login
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/90 backdrop-blur-md border-gray-700/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <ShieldX className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-light text-gray-200">Acesso Negado</CardTitle>
          <CardDescription className="text-gray-400">
            Você não tem permissão para acessar esta área
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-300 space-y-2">
            <p>
              Sua conta ({user.email}) não possui as permissões necessárias para acessar esta funcionalidade.
            </p>
            <p>
              Se você acredita que deveria ter acesso, entre em contato com um administrador do sistema.
            </p>
            {user.user_role && (
              <p className="pt-2 text-xs text-gray-400">
                Função atual: <span className="font-medium">{user.user_role}</span>
              </p>
            )}
          </div>

          <div className="pt-4 space-y-2 border-t border-gray-700">
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
              onClick={handleGoHome}
            >
              <Home className="h-4 w-4 mr-2 stroke-1" />
              Voltar ao Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 stroke-1" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

