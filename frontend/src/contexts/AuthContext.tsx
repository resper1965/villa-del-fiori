"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  name: string
  email: string
  user_role: "admin" | "syndic" | "subsindico" | "council" | "resident" | "staff"
  type: string
  is_approved: boolean
  is_superadmin?: boolean
}

// UID do superadministrador (definido em variável de ambiente)
const SUPERADMIN_UID = process.env.NEXT_PUBLIC_SUPERADMIN_UID || "23d80a86-4099-46c4-8102-43002206c46f"

// Tipos para app_metadata do Supabase Auth
interface AppMetadata {
  user_role?: "admin" | "syndic" | "subsindico" | "council" | "resident" | "staff"
  is_approved?: boolean
  approved_at?: string
  approved_by?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginSimple: (password: string) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Carregar usuário do Supabase Auth (roles gerenciados via app_metadata)
  const loadUser = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Roles e aprovação vêm do app_metadata do Supabase Auth
      const appMetadata = (supabaseUser.app_metadata || {}) as AppMetadata
      const userMetadata = supabaseUser.user_metadata || {}

      // Buscar dados adicionais da tabela stakeholders (se existir)
      let stakeholder = null
      try {
        const { data, error } = await supabase
          .from("stakeholders")
          .select("id, name, type")
          .eq("auth_user_id", supabaseUser.id)
          .maybeSingle()
        
        if (!error) {
          stakeholder = data
        }
      } catch (err) {
        // Se não encontrar na tabela, não é crítico - usamos dados do Auth
        console.warn("Stakeholder table not found or RLS blocking:", err)
      }

      // Verificar se é superadministrador
      const isSuperadmin = supabaseUser.id === SUPERADMIN_UID

      // Usar app_metadata para roles e aprovação (gerenciado pelo Supabase Auth)
      // Superadmin sempre tem role admin e está aprovado
      const userRole = isSuperadmin ? "admin" : (appMetadata.user_role || "resident")
      const isApproved = isSuperadmin ? true : (appMetadata.is_approved || false)

      return {
        id: supabaseUser.id,
        name: userMetadata.name || stakeholder?.name || supabaseUser.email?.split("@")[0] || "Usuário",
        email: supabaseUser.email || "",
        user_role: userRole,
        type: userMetadata.type || stakeholder?.type || "morador",
        is_approved: isApproved,
        is_superadmin: isSuperadmin,
      }
    } catch (error) {
      console.error("Error loading user:", error)
      return null
    }
  }, [])

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const initAuth = async () => {
      try {
        // Timeout de segurança (10 segundos)
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn("Auth initialization timeout")
            setIsLoading(false)
          }
        }, 10000)

        // Verificar sessão atual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          if (mounted) {
            setIsLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          const loadedUser = await loadUser(session.user)
          if (loadedUser && mounted) {
            // Verificar se está aprovado
            if (!loadedUser.is_approved && !loadedUser.is_superadmin) {
              router.push("/auth/waiting-approval")
              setIsLoading(false)
              return
            }
            setUser(loadedUser)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_IN" && session?.user) {
        const loadedUser = await loadUser(session.user)
        if (loadedUser) {
          // Superadmin sempre tem acesso, mesmo sem aprovação
          if (!loadedUser.is_approved && !loadedUser.is_superadmin) {
            router.push("/auth/waiting-approval")
            setIsLoading(false)
            return
          }
          setUser(loadedUser)
          setIsAuthenticated(true)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [loadUser, router])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return false
      }

      if (data.user) {
        const loadedUser = await loadUser(data.user)
        if (loadedUser) {
          // Superadmin sempre tem acesso, mesmo sem aprovação
          if (!loadedUser.is_approved && !loadedUser.is_superadmin) {
            router.push("/auth/waiting-approval")
            return false
          }
          setUser(loadedUser)
          setIsAuthenticated(true)
          return true
        }
      }

      return false
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      return false
    }
  }, [loadUser, router])

  const loginSimple = useCallback(async (password: string): Promise<boolean> => {
    // Para login simples, tentar com um email padrão ou criar usuário temporário
    // Por enquanto, vamos usar um email padrão do sistema
    const systemEmail = "sistema@villadelfiori.com"
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: systemEmail,
        password,
      })

      if (error) {
        console.error("Login simple error:", error)
        return false
      }

      if (data.user) {
        const loadedUser = await loadUser(data.user)
        if (loadedUser) {
          // Superadmin sempre tem acesso, mesmo sem aprovação
          if (!loadedUser.is_approved && !loadedUser.is_superadmin) {
            router.push("/auth/waiting-approval")
            return false
          }
          setUser(loadedUser)
          setIsAuthenticated(true)
          return true
        }
      }

      return false
    } catch (error: any) {
      console.error("Erro ao fazer login simples:", error)
      return false
    }
  }, [loadUser, router])

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAuthenticated(false)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Mesmo com erro, limpar estado local
      setUser(null)
      setIsAuthenticated(false)
      router.push("/login")
    }
  }, [router])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        return false
      }

      if (session?.user) {
        const loadedUser = await loadUser(session.user)
        if (loadedUser) {
          // Superadmin sempre tem acesso, mesmo sem aprovação
          if (!loadedUser.is_approved && !loadedUser.is_superadmin) {
            return false
          }
          setUser(loadedUser)
          setIsAuthenticated(true)
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Erro ao renovar token:", error)
      return false
    }
  }, [loadUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginSimple,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
