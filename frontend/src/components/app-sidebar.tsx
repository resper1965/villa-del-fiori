"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Users,
  MessageSquare,
  Truck,
  ClipboardList,
  Database,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useRBAC } from "@/lib/hooks/useRBAC"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { canAccessDashboard, canAccessChat, canApproveUsers } = useRBAC()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Construir menu baseado em permissões
  const menuItems: Array<{
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }> = []

  if (canAccessDashboard()) {
    menuItems.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard })
    menuItems.push({ href: "/cadastros", label: "Cadastros", icon: ClipboardList })
    menuItems.push({ href: "/processes", label: "Processos", icon: FileText })
    menuItems.push({ href: "/entities", label: "Entidades", icon: Users })
    menuItems.push({ href: "/suppliers", label: "Fornecedores", icon: Truck })
  }

  if (canAccessChat()) {
    menuItems.push({ href: "/chat", label: "Chat", icon: MessageSquare })
  }

  if (canApproveUsers()) {
    menuItems.push({ href: "/admin/users", label: "Usuários", icon: Users })
    menuItems.push({ href: "/admin/knowledge-base", label: "Base de Conhecimento", icon: Database })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.png"
                    alt="Gabi - Síndica Virtual"
                    width={32}
                    height={32}
                    className="h-auto w-auto"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Gabi</span>
                  <span className="truncate text-xs">Síndica Virtual</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

