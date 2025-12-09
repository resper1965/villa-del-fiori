import { useAuth } from "@/contexts/AuthContext"

export type UserRole = "admin" | "syndic" | "subsindico" | "council" | "resident" | "staff"

/**
 * Hook para verificar permissões baseadas em roles (RBAC)
 */
export function useRBAC() {
  const { user } = useAuth()

  // Superadmin tem todas as permissões
  const isSuperadmin = (): boolean => {
    return user?.is_superadmin === true
  }

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    // Superadmin tem todas as roles
    if (isSuperadmin()) return true
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.user_role)
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return hasRole(roles)
  }

  const isAdmin = (): boolean => {
    return hasRole("admin")
  }

  const isSyndic = (): boolean => {
    return hasRole(["admin", "syndic", "subsindico"])
  }

  const isCouncil = (): boolean => {
    return hasRole(["admin", "syndic", "subsindico", "council"])
  }

  const isStaff = (): boolean => {
    return hasRole(["admin", "syndic", "subsindico", "staff"])
  }

  const isResident = (): boolean => {
    return hasRole("resident")
  }

  const canAccessDashboard = (): boolean => {
    if (!user) return false
    // Superadmin sempre tem acesso
    if (isSuperadmin()) return true
    // Moradores só podem acessar o chat
    if (user.user_role === "resident") return false
    return true
  }

  const canAccessProcesses = (): boolean => {
    return canAccessDashboard()
  }

  const canAccessChat = (): boolean => {
    // Superadmin sempre tem acesso
    if (isSuperadmin()) return true
    // Todos os usuários aprovados podem acessar o chat
    return !!user && user.is_approved
  }

  const canApproveUsers = (): boolean => {
    // Superadmin sempre pode aprovar usuários
    if (isSuperadmin()) return true
    return hasRole(["admin", "syndic", "subsindico"])
  }

  const canManageProcesses = (): boolean => {
    // Superadmin sempre pode gerenciar processos
    if (isSuperadmin()) return true
    return hasRole(["admin", "syndic", "subsindico", "council", "staff"])
  }

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isSyndic,
    isCouncil,
    isStaff,
    isResident,
    isSuperadmin,
    canAccessDashboard,
    canAccessProcesses,
    canAccessChat,
    canApproveUsers,
    canManageProcesses,
    user,
  }
}

