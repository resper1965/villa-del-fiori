"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export default function WaitingApprovalPage() {
  const router = useRouter()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Verificar periodicamente se foi aprovado
  useEffect(() => {
    const checkApproval = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        // Verificar app_metadata do Supabase Auth
        const appMetadata = authUser.app_metadata as any
        if (appMetadata?.is_approved) {
          router.push("/dashboard")
          return
        }

        // Fallback: verificar na tabela stakeholders
        try {
          const { data: stakeholder } = await supabase
            .from("stakeholders")
            .select("is_approved")
            .eq("auth_user_id", authUser.id)
            .maybeSingle()

          if (stakeholder?.is_approved) {
            router.push("/dashboard")
          }
        } catch (err) {
          // Se não encontrar na tabela, não é crítico
          console.warn("Erro ao verificar aprovação:", err)
        }
      }
    }

    // Verificar a cada 30 segundos
    const interval = setInterval(checkApproval, 30000)
    checkApproval() // Verificar imediatamente

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/90 backdrop-blur-md border-gray-700/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-light text-gray-200">Aguardando Aprovação</CardTitle>
          <CardDescription className="text-gray-400">
            Sua conta está aguardando aprovação de um administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-300 space-y-2">
            <p>
              Seu cadastro foi recebido com sucesso! Um administrador do sistema irá revisar
              sua solicitação e aprovar seu acesso.
            </p>
            <p>
              Você receberá um email quando sua conta for aprovada. Esta página será atualizada
              automaticamente quando isso acontecer.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700">
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

