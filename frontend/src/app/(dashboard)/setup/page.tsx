"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2 } from "lucide-react"
import { CondominiumForm } from "@/components/condominiums/CondominiumForm"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Página de setup inicial para cadastro obrigatório do condomínio
 * Esta página é acessada quando não há condomínio cadastrado
 */
export default function SetupPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [setupOpen, setSetupOpen] = useState(true)

  // Verificar se já existe condomínio
  const { data: condominium, isLoading: condominiumLoading } = useQuery({
    queryKey: ["condominium"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("condominiums")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      return data || null
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Se já houver condomínio, redirecionar para dashboard
  useEffect(() => {
    if (!authLoading && !condominiumLoading && condominium) {
      router.replace("/dashboard")
    }
  }, [condominium, authLoading, condominiumLoading, router])

  // Se não estiver autenticado, redirecionar para login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || condominiumLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao Gabi!</CardTitle>
          <CardDescription className="text-base mt-2">
            Para começar, é necessário cadastrar o condomínio. Esta é uma etapa obrigatória e
            apenas um condomínio pode ser cadastrado por vez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CondominiumForm
            open={setupOpen}
            onOpenChange={(open) => {
              // Não permitir fechar sem cadastrar
              if (!open && !condominium) {
                setSetupOpen(true)
              } else {
                setSetupOpen(open)
              }
            }}
            onSuccess={async () => {
              // Invalidar cache e redirecionar
              await queryClient.invalidateQueries({ queryKey: ["condominium"] })
              router.replace("/dashboard")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

