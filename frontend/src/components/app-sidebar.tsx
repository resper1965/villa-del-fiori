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
  User,
  MoreVertical,
  UserCircle,
  CreditCard,
  Bell,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useRBAC } from "@/lib/hooks/useRBAC"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const { canAccessDashboard, canAccessChat, canApproveUsers } = useRBAC()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Mapear roles para labels mais amigáveis
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    syndic: "Síndico",
    subsindico: "Subsíndico",
    council: "Conselheiro",
    staff: "Staff",
    resident: "Morador",
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Análise de UX: Organização do menu por frequência de uso e hierarquia
  // Grupo 1: Navegação Principal (mais usado, sempre visível)
  const mainMenuItems: Array<{
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }> = []

  if (canAccessDashboard()) {
    mainMenuItems.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard })
    mainMenuItems.push({ href: "/processes", label: "Processos", icon: FileText })
  }

  if (canAccessChat()) {
    mainMenuItems.push({ href: "/chat", label: "Chat", icon: MessageSquare })
  }

  // Grupo 2: Cadastros (agrupamento lógico de dados)
  const cadastroMenuItems: Array<{
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }> = []

  if (canAccessDashboard()) {
    cadastroMenuItems.push({ href: "/cadastros", label: "Cadastros", icon: ClipboardList })
    cadastroMenuItems.push({ href: "/entities", label: "Entidades", icon: Users })
    cadastroMenuItems.push({ href: "/suppliers", label: "Fornecedores", icon: Truck })
  }

  // Grupo 3: Administração (menos frequente, no final)
  const adminMenuItems: Array<{
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }> = []

  if (canApproveUsers()) {
    adminMenuItems.push({ href: "/admin/users", label: "Usuários", icon: Users })
    adminMenuItems.push({ href: "/admin/knowledge-base", label: "Base de Conhecimento", icon: Database })
  }

  return (
    <Sidebar collapsible="icon" className="flex flex-col h-screen">
      <SidebarHeader className="border-b border-sidebar-border shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center justify-start w-full h-full p-2">
                {isCollapsed ? (
                  <span className="text-xl font-semibold text-primary">G.</span>
                ) : (
                  <Image
                    src="/logo.png"
                    alt="Gabi - Síndica Virtual"
                    width={84}
                    height={84}
                    className="w-auto h-auto max-h-[69px] object-contain object-left"
                    priority
                  />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1 min-h-0">
        {/* Grupo 1: Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
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

        {/* Grupo 2: Cadastros */}
        {cadastroMenuItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              {!isCollapsed && <SidebarGroupLabel>Cadastros</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {cadastroMenuItems.map((item) => {
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
          </>
        )}

        {/* Grupo 3: Administração */}
        {adminMenuItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              {!isCollapsed && <SidebarGroupLabel>Administração</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => {
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
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="shrink-0 border-t border-sidebar-border">
        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="" alt={user.name || user.email} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium text-sidebar-foreground">
                            {user.name || user.email}
                          </span>
                          <span className="truncate text-xs text-sidebar-foreground/70">
                            {roleLabels[user.user_role] || user.user_role}
                          </span>
                        </div>
                        <MoreVertical className="ml-auto h-4 w-4" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={isCollapsed ? "right" : "top"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="" alt={user.name || user.email} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{user.name || user.email}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {roleLabels[user.user_role] || user.user_role}
                          {user.unit && ` • ${user.unit.number}${user.unit.block ? ` - Bloco ${user.unit.block}` : ""}`}
                        </span>
                        {user.type && user.type !== user.user_role && (
                          <span className="truncate text-xs text-muted-foreground/70">
                            {user.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notificações</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

