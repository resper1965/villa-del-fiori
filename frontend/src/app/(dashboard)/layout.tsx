"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Menu,
  Building2,
  LogOut,
  Users,
  MessageSquare,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRBAC } from "@/lib/hooks/useRBAC"
import Login from "@/components/auth/Login"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isAuthenticated, isLoading, login, logout } = useAuth()
  const { canAccessDashboard, canAccessChat, canApproveUsers } = useRBAC()

  const handleLogin = (password: string) => {
    const success = login(password)
    if (success) {
      // Login bem-sucedido, não precisa redirecionar pois já está no dashboard
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-400 font-light">Carregando...</div>
      </div>
    )
  }

  // Se não autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // Não redirecionar moradores aqui - deixar cada página lidar com suas próprias permissões
  // O layout sempre será mostrado se o usuário estiver autenticado

  // Construir menu baseado em permissões
  const menuItems = []
  
  if (canAccessDashboard()) {
    menuItems.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard })
    menuItems.push({ href: "/processes", label: "Processos", icon: FileText })
    menuItems.push({ href: "/entities", label: "Entidades", icon: Users })
  }
  
  if (canAccessChat()) {
    menuItems.push({ href: "/chat", label: "Chat", icon: MessageSquare })
  }
  
  if (canApproveUsers()) {
    menuItems.push({ href: "/admin/users", label: "Usuários", icon: Users })
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="h-[73px] p-4 border-b border-border flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#00ade8] stroke-1" />
              {sidebarOpen && (
                <h2 className="text-sm font-semibold text-foreground tracking-wide">
                  Gabi
                </h2>
              )}
            </div>
            {sidebarOpen && (
              <p className="text-xs text-muted-foreground ml-7">
                Síndica Virtual
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            <Menu className="h-5 w-5 stroke-1" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#00ade8] text-white"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0 stroke-1" />
                {sidebarOpen && <span className="text-sm font-light">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Botão de Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 stroke-1" />
            {sidebarOpen && <span className="text-sm font-light ml-3">Sair</span>}
          </Button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}


