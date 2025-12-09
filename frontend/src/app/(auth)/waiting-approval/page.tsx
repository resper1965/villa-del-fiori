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
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Verificar periodicamente se foi aprovado
  useEffect(() => {
    const checkApproval = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: stakeholder } = await supabase
          .from("stakeholders")
          .select("is_approved")
          .eq("auth_user_id", user.id)
          .single()

        if (stakeholder?.is_approved) {
          router.push("/dashboard")
        }
      }
    }

    // Verificar a cada 30 segundos
    const interval = setInterval(checkApproval, 30000)
    checkApproval() // Verificar imediatamente

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-light">Aguardando Aprovação</CardTitle>
          <CardDescription>
            Sua conta está aguardando aprovação de um administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Seu cadastro foi recebido com sucesso! Um administrador do sistema irá revisar
              sua solicitação e aprovar seu acesso.
            </p>
            <p>
              Você receberá um email quando sua conta for aprovada. Esta página será atualizada
              automaticamente quando isso acontecer.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
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

