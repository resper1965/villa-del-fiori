import { useAuth } from "@/contexts/AuthContext"

export type UserRole = "admin" | "syndic" | "subsindico" | "council" | "resident" | "staff"

/**
 * Hook para verificar permissões baseadas em roles (RBAC)
 */
export function useRBAC() {
  const { user } = useAuth()

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
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
    // Moradores só podem acessar o chat
    if (user.user_role === "resident") return false
    return true
  }

  const canAccessProcesses = (): boolean => {
    return canAccessDashboard()
  }

  const canAccessChat = (): boolean => {
    // Todos os usuários aprovados podem acessar o chat
    return !!user && user.is_approved
  }

  const canApproveUsers = (): boolean => {
    return hasRole(["admin", "syndic", "subsindico"])
  }

  const canManageProcesses = (): boolean => {
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
    canAccessDashboard,
    canAccessProcesses,
    canAccessChat,
    canApproveUsers,
    canManageProcesses,
    user,
  }
}

