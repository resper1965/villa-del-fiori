"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { PageTitle } from "@/components/PageTitle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header com título e notificações */}
        <header className="h-[73px] border-b border-border bg-card backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <PageTitle />
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto bg-transparent">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
