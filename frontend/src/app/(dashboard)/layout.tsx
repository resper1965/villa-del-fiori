"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { PageTitle } from "@/components/PageTitle"
import { CondominiumGuard } from "@/components/condominium/CondominiumGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()
  const isSetupPage = pathname === "/setup"

  // Se não autenticado, redirecionar para página de login (hooks devem vir antes de returns)
  useEffect(() => {
    // Timeout de segurança: se isLoading ficar true por mais de 5 segundos, forçar redirecionamento
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.warn("Dashboard layout: isLoading stuck, forcing redirect to login")
        router.push("/login")
      }, 5000)

      return () => clearTimeout(timeoutId)
    }

    if (!isAuthenticated && !isLoading) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading enquanto verifica autenticação (com timeout visual)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground font-light">Carregando...</div>
          <div className="text-xs text-muted-foreground/50">Se demorar, tente recarregar a página</div>
        </div>
      </div>
    )
  }

  // Se não autenticado, mostrar mensagem de redirecionamento
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-muted-foreground font-light">Redirecionando para login...</div>
      </div>
    )
  }

  // Não redirecionar moradores aqui - deixar cada página lidar com suas próprias permissões
  // O layout sempre será mostrado se o usuário estiver autenticado

  // Se for página de setup, não mostrar layout completo
  if (isSetupPage) {
    return <CondominiumGuard>{children}</CondominiumGuard>
  }

  return (
    <CondominiumGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          {/* Header com título e notificações - fixo no topo */}
          <header className="h-[73px] shrink-0 border-b border-border bg-card backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <PageTitle />
            </div>
            <NotificationBell />
          </header>
          {/* Conteúdo principal com scroll */}
          <main className="flex-1 overflow-y-auto bg-transparent">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </CondominiumGuard>
  )
}
