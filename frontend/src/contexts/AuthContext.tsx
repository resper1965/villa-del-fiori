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

  // Carregar stakeholder do banco baseado no usuário autenticado
  const loadStakeholder = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Buscar stakeholder pelo email ou auth_user_id
      const { data: stakeholder, error } = await supabase
        .from("stakeholders")
        .select("*")
        .or(`email.eq.${supabaseUser.email},auth_user_id.eq.${supabaseUser.id}`)
        .single()

      if (error || !stakeholder) {
        console.error("Stakeholder not found:", error)
        return null
      }

      return {
        id: stakeholder.id,
        name: stakeholder.name,
        email: stakeholder.email,
        user_role: stakeholder.user_role || "resident",
        type: stakeholder.type || "morador",
        is_approved: stakeholder.is_approved || false,
      }
    } catch (error) {
      console.error("Error loading stakeholder:", error)
      return null
    }
  }, [])

  // Inicializar autenticação
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar sessão atual
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const stakeholder = await loadStakeholder(session.user)
          if (stakeholder) {
            // Verificar se está aprovado
            if (!stakeholder.is_approved) {
              router.push("/auth/waiting-approval")
              return
            }
            setUser(stakeholder)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const stakeholder = await loadStakeholder(session.user)
        if (stakeholder) {
          // Verificar se está aprovado
          if (!stakeholder.is_approved) {
            router.push("/auth/waiting-approval")
            return
          }
          setUser(stakeholder)
          setIsAuthenticated(true)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadStakeholder])

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
        const stakeholder = await loadStakeholder(data.user)
        if (stakeholder) {
          // Verificar se está aprovado
          if (!stakeholder.is_approved) {
            router.push("/auth/waiting-approval")
            return false
          }
          setUser(stakeholder)
          setIsAuthenticated(true)
          return true
        }
      }

      return false
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      return false
    }
  }, [loadStakeholder, router])

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
        const stakeholder = await loadStakeholder(data.user)
        if (stakeholder) {
          // Verificar se está aprovado
          if (!stakeholder.is_approved) {
            router.push("/auth/waiting-approval")
            return false
          }
          setUser(stakeholder)
          setIsAuthenticated(true)
          return true
        }
      }

      return false
    } catch (error: any) {
      console.error("Erro ao fazer login simples:", error)
      return false
    }
  }, [loadStakeholder, router])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }, [router])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.refreshSession()

      if (session?.user) {
        const stakeholder = await loadStakeholder(session.user)
        if (stakeholder) {
          // Verificar se está aprovado
          if (!stakeholder.is_approved) {
            return false
          }
          setUser(stakeholder)
          setIsAuthenticated(true)
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Erro ao renovar token:", error)
      return false
    }
  }, [loadStakeholder])

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

