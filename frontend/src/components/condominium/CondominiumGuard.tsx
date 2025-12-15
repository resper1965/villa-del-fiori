"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

/**
 * Guard que verifica se existe um condomínio cadastrado
 * Se não existir, redireciona para página de setup
 * Se existir, permite acesso normal
 */
export function CondominiumGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Rotas que não precisam de condomínio
  const publicRoutes = ["/login", "/auth/waiting-approval", "/auth/unauthorized", "/setup"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  // Verificar se existe condomínio ativo
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
    enabled: isAuthenticated && !isPublicRoute,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Redirecionar para setup se não houver condomínio
  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated &&
      !isPublicRoute &&
      !condominiumLoading &&
      !condominium &&
      pathname !== "/setup"
    ) {
      router.replace("/setup")
    }
  }, [authLoading, isAuthenticated, isPublicRoute, condominiumLoading, condominium, pathname, router])

  // Se estiver em rota pública ou ainda carregando, permitir acesso
  if (isPublicRoute || authLoading || (isAuthenticated && condominiumLoading)) {
    return <>{children}</>
  }

  // Se não estiver autenticado, permitir acesso (será redirecionado pelo AuthContext)
  if (!isAuthenticated) {
    return <>{children}</>
  }

  // Se não houver condomínio e não estiver na página de setup, mostrar loading
  // (será redirecionado pelo useEffect acima)
  if (!condominium && pathname !== "/setup") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <div className="text-muted-foreground font-light">Verificando condomínio...</div>
        </div>
      </div>
    )
  }

  // Se houver condomínio, permitir acesso normal
  return <>{children}</>
}

