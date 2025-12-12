import { useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"

export type UserRole = "admin" | "syndic" | "subsindico" | "council" | "resident" | "staff"

/**
 * Hook para verificar permissões baseadas em roles (RBAC)
 * Otimizado com useMemo para evitar re-renders desnecessários
 */
export function useRBAC() {
  const { user } = useAuth()
  
  // Memoizar valor de superadmin
  const isSuperadminValue = useMemo(() => user?.is_superadmin === true, [user?.is_superadmin])
  const userRole = useMemo(() => user?.user_role, [user?.user_role])
  const isApproved = useMemo(() => user?.is_approved, [user?.is_approved])

  // Funções memoizadas para evitar recriação
  const hasRole = useMemo(() => {
    return (role: UserRole | UserRole[]): boolean => {
      if (!user) return false
      // Superadmin tem todas as roles
      if (isSuperadminValue) return true
      const roles = Array.isArray(role) ? role : [role]
      return roles.includes(userRole as UserRole)
    }
  }, [user, isSuperadminValue, userRole])

  const isSuperadmin = useMemo(() => () => isSuperadminValue, [isSuperadminValue])
  const hasAnyRole = useMemo(() => (roles: UserRole[]) => hasRole(roles), [hasRole])
  const isAdmin = useMemo(() => () => hasRole("admin"), [hasRole])
  const isSyndic = useMemo(() => () => hasRole(["admin", "syndic", "subsindico"]), [hasRole])
  const isCouncil = useMemo(() => () => hasRole(["admin", "syndic", "subsindico", "council"]), [hasRole])
  const isStaff = useMemo(() => () => hasRole(["admin", "syndic", "subsindico", "staff"]), [hasRole])
  const isResident = useMemo(() => () => hasRole("resident"), [hasRole])

  const canAccessDashboard = useMemo(() => {
    return (): boolean => {
      if (!user) return false
      if (isSuperadminValue) return true
      if (userRole === "resident") return false
      return true
    }
  }, [user, isSuperadminValue, userRole])

  const canAccessProcesses = useMemo(() => () => canAccessDashboard(), [canAccessDashboard])
  
  const canAccessChat = useMemo(() => {
    return (): boolean => {
      if (isSuperadminValue) return true
      return !!user && !!isApproved
    }
  }, [user, isSuperadminValue, isApproved])

  const canApproveUsers = useMemo(() => {
    return (): boolean => {
      if (isSuperadminValue) return true
      return hasRole(["admin", "syndic", "subsindico"])
    }
  }, [hasRole, isSuperadminValue])

  const canManageProcesses = useMemo(() => {
    return (): boolean => {
      if (isSuperadminValue) return true
      return hasRole(["admin", "syndic", "subsindico", "council", "staff"])
    }
  }, [hasRole, isSuperadminValue])

  return useMemo(() => ({
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
  }), [hasRole, hasAnyRole, isAdmin, isSyndic, isCouncil, isStaff, isResident, isSuperadmin, canAccessDashboard, canAccessProcesses, canAccessChat, canApproveUsers, canManageProcesses, user])
}

