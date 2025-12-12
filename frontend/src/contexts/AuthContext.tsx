"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  name: string
  email: string
  user_role: "admin" | "syndic" | "subsindico" | "council" | "resident" | "staff"
  type: string
  unit_id?: string | null
  unit?: {
    id: string
    number: string
    block?: string
    floor?: number
  } | null
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
  const isProcessingLoginRef = useRef(false)

  // Carregar usuário do Supabase Auth (roles gerenciados via app_metadata)
  const loadUser = useCallback(async (supabaseUser: SupabaseUser, skipStakeholderQuery = false): Promise<User | null> => {
    try {
      // Roles e aprovação vêm do app_metadata do Supabase Auth
      const appMetadata = (supabaseUser.app_metadata || {}) as AppMetadata
      const userMetadata = supabaseUser.user_metadata || {}

      // Buscar dados adicionais da tabela stakeholders (se existir)
      // Com timeout muito curto (800ms) para não bloquear a inicialização
      // E opção de pular completamente para carregamento rápido
      let stakeholder = null
      if (!skipStakeholderQuery) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 800) // Reduzido para 800ms
          )
          
          const queryPromise = supabase
            .from("stakeholders")
            .select("id, name, type, unit_id, unit:units(id, number, block, floor)")
            .eq("auth_user_id", supabaseUser.id)
            .maybeSingle()
          
          const result = await Promise.race([queryPromise, timeoutPromise]) as any
          
          // Verificar se o resultado é válido (não é o timeout)
          if (result && !result.error && result.data) {
            stakeholder = result.data
          } else if (result && result.data) {
            // Resultado válido mas sem dados
            stakeholder = result.data
          }
        } catch (err) {
          // Se não encontrar na tabela ou timeout, não é crítico - usamos dados do Auth
          // Não logar como warning para não poluir o console
        }
      }

      // Verificar se é superadministrador
      const isSuperadmin = supabaseUser.id === SUPERADMIN_UID

      // Usar app_metadata para roles e aprovação (gerenciado pelo Supabase Auth)
      // Superadmin sempre tem role admin e está aprovado
      const userRole = isSuperadmin ? "admin" : (appMetadata.user_role || "resident")
      const isApproved = isSuperadmin ? true : (appMetadata.is_approved || false)

      // Processar dados da unidade
      const unitData = stakeholder?.unit
        ? (Array.isArray(stakeholder.unit) ? stakeholder.unit[0] : stakeholder.unit)
        : null

      return {
        id: supabaseUser.id,
        name: userMetadata.name || stakeholder?.name || supabaseUser.email?.split("@")[0] || "Usuário",
        email: supabaseUser.email || "",
        user_role: userRole,
        type: userMetadata.type || stakeholder?.type || "morador",
        unit_id: stakeholder?.unit_id || null,
        unit: unitData || null,
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
    let initCompleted = false

    const initAuth = async () => {
      // Timeout de segurança: sempre resetar isLoading após 3 segundos
      timeoutId = setTimeout(() => {
        if (mounted && !initCompleted) {
          console.warn("Auth initialization timeout - forcing isLoading to false")
          setIsLoading(false)
          initCompleted = true
        }
      }, 3000)

      try {
        // Verificar sessão atual com timeout próprio
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Session timeout")), 2500)
        )

        const {
          data: { session },
          error: sessionError,
        } = await Promise.race([sessionPromise, timeoutPromise]) as any

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          if (mounted && !initCompleted) {
            setIsLoading(false)
            initCompleted = true
          }
          if (timeoutId) clearTimeout(timeoutId)
          return
        }

        if (session?.user && mounted && !initCompleted) {
          // Criar usuário básico imediatamente (sem esperar stakeholders)
          const appMetadata = (session.user.app_metadata || {}) as AppMetadata
          const userMetadata = session.user.user_metadata || {}
          const isSuperadmin = session.user.id === SUPERADMIN_UID
          const userRole = isSuperadmin ? "admin" : (appMetadata.user_role || "resident")
          const isApproved = isSuperadmin ? true : (appMetadata.is_approved || false)
          
          const basicUser: User = {
            id: session.user.id,
            name: userMetadata.name || session.user.email?.split("@")[0] || "Usuário",
            email: session.user.email || "",
            user_role: userRole,
            type: userMetadata.type || "morador",
            is_approved: isApproved,
            is_superadmin: isSuperadmin,
          }
          
          // Verificar aprovação primeiro
          if (!basicUser.is_approved && !basicUser.is_superadmin) {
            setIsLoading(false)
            initCompleted = true
            if (timeoutId) clearTimeout(timeoutId)
            router.replace("/auth/waiting-approval")
            return
          }
          
          // Definir usuário básico imediatamente para não bloquear UI
          setUser(basicUser)
          setIsAuthenticated(true)
          setIsLoading(false)
          initCompleted = true
          if (timeoutId) clearTimeout(timeoutId)
          
          // Carregar dados adicionais (stakeholder/unit) em background sem bloquear
          loadUser(session.user, false).then((loadedUser) => {
            if (loadedUser && mounted) {
              // Atualizar apenas se tiver dados adicionais (unit, etc)
              if (loadedUser.unit_id || loadedUser.unit) {
                setUser(loadedUser)
              }
            }
          }).catch(() => {
            // Ignorar erros no carregamento em background
          })
        } else if (mounted && !initCompleted) {
          setIsLoading(false)
          initCompleted = true
          if (timeoutId) clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted && !initCompleted) {
          setIsLoading(false)
          initCompleted = true
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    initAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Ignorar eventos durante a inicialização para evitar race conditions
      if (event === "INITIAL_SESSION" && !initCompleted) {
        return
      }

      if (event === "SIGNED_IN" && session?.user) {
        // Evitar processar se já estiver processando login (evitar duplicação)
        if (isProcessingLoginRef.current) {
          return
        }
        
        try {
          // Criar usuário básico primeiro para não bloquear
          const appMetadata = (session.user.app_metadata || {}) as AppMetadata
          const userMetadata = session.user.user_metadata || {}
          const isSuperadmin = session.user.id === SUPERADMIN_UID
          const userRole = isSuperadmin ? "admin" : (appMetadata.user_role || "resident")
          const isApproved = isSuperadmin ? true : (appMetadata.is_approved || false)
          
          const basicUser: User = {
            id: session.user.id,
            name: userMetadata.name || session.user.email?.split("@")[0] || "Usuário",
            email: session.user.email || "",
            user_role: userRole,
            type: userMetadata.type || "morador",
            is_approved: isApproved,
            is_superadmin: isSuperadmin,
          }
          
          if (!basicUser.is_approved && !basicUser.is_superadmin) {
            if (mounted) {
              setIsLoading(false)
              router.replace("/auth/waiting-approval")
            }
            return
          }
          
          // Definir usuário básico imediatamente
          if (mounted) {
            setUser(basicUser)
            setIsAuthenticated(true)
            setIsLoading(false)
          }
          
          // Carregar dados adicionais em background
          loadUser(session.user, false).then((loadedUser) => {
            if (loadedUser && mounted) {
              if (loadedUser.unit_id || loadedUser.unit) {
                setUser(loadedUser)
              }
            }
          }).catch(() => {
            // Ignorar erros
          })
        } catch (loadError) {
          console.error("Error loading user in auth state change:", loadError)
          if (mounted) {
            setIsLoading(false)
          }
        }
      } else if (event === "SIGNED_OUT") {
        if (mounted) {
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
        }
      } else if (event === "TOKEN_REFRESHED" && session?.user && mounted) {
        // Atualizar usuário silenciosamente sem resetar loading
        loadUser(session.user, false).then((loadedUser) => {
          if (loadedUser && mounted) {
            setUser(loadedUser)
          }
        }).catch(() => {
          // Ignorar erros
        })
      } else if (mounted && !initCompleted) {
        // Apenas resetar loading se ainda não foi completado
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      initCompleted = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [loadUser, router])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (isProcessingLoginRef.current) {
      console.warn("Login already in progress")
      return false
    }

    try {
      isProcessingLoginRef.current = true
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        setIsLoading(false)
        isProcessingLoginRef.current = false
        return false
      }

      if (data.user) {
        // Criar usuário básico imediatamente (sem esperar stakeholders)
        const appMetadata = (data.user.app_metadata || {}) as AppMetadata
        const userMetadata = data.user.user_metadata || {}
        const isSuperadmin = data.user.id === SUPERADMIN_UID
        const userRole = isSuperadmin ? "admin" : (appMetadata.user_role || "resident")
        const isApproved = isSuperadmin ? true : (appMetadata.is_approved || false)
        
        const basicUser: User = {
          id: data.user.id,
          name: userMetadata.name || data.user.email?.split("@")[0] || "Usuário",
          email: data.user.email || "",
          user_role: userRole,
          type: userMetadata.type || "morador",
          is_approved: isApproved,
          is_superadmin: isSuperadmin,
        }
        
        if (!basicUser.is_approved && !basicUser.is_superadmin) {
          setIsLoading(false)
          isProcessingLoginRef.current = false
          router.replace("/auth/waiting-approval")
          return false
        }
        
        // Definir usuário básico imediatamente
        setUser(basicUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        isProcessingLoginRef.current = false
        
        // Carregar dados adicionais em background
        loadUser(data.user, false).then((loadedUser) => {
          if (loadedUser) {
            if (loadedUser.unit_id || loadedUser.unit) {
              setUser(loadedUser)
            }
          }
        }).catch(() => {
          // Ignorar erros
        })
        
        return true
      }

      setIsLoading(false)
      isProcessingLoginRef.current = false
      return false
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      setIsLoading(false)
      isProcessingLoginRef.current = false
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
        // Criar usuário básico imediatamente
        const appMetadata = (data.user.app_metadata || {}) as AppMetadata
        const userMetadata = data.user.user_metadata || {}
        const isSuperadmin = data.user.id === SUPERADMIN_UID
        const userRole = isSuperadmin ? "admin" : (appMetadata.user_role || "resident")
        const isApproved = isSuperadmin ? true : (appMetadata.is_approved || false)
        
        const basicUser: User = {
          id: data.user.id,
          name: userMetadata.name || data.user.email?.split("@")[0] || "Usuário",
          email: data.user.email || "",
          user_role: userRole,
          type: userMetadata.type || "morador",
          is_approved: isApproved,
          is_superadmin: isSuperadmin,
        }
        
        if (!basicUser.is_approved && !basicUser.is_superadmin) {
          router.push("/auth/waiting-approval")
          return false
        }
        
        setUser(basicUser)
        setIsAuthenticated(true)
        
        // Carregar dados adicionais em background
        loadUser(data.user, false).then((loadedUser) => {
          if (loadedUser) {
            if (loadedUser.unit_id || loadedUser.unit) {
              setUser(loadedUser)
            }
          }
        }).catch(() => {
          // Ignorar erros
        })
        
        return true
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
        // Criar usuário básico imediatamente
        const appMetadata = (session.user.app_metadata || {}) as AppMetadata
        const userMetadata = session.user.user_metadata || {}
        const isSuperadmin = session.user.id === SUPERADMIN_UID
        const userRole = isSuperadmin ? "admin" : (appMetadata.user_role || "resident")
        const isApproved = isSuperadmin ? true : (appMetadata.is_approved || false)
        
        const basicUser: User = {
          id: session.user.id,
          name: userMetadata.name || session.user.email?.split("@")[0] || "Usuário",
          email: session.user.email || "",
          user_role: userRole,
          type: userMetadata.type || "morador",
          is_approved: isApproved,
          is_superadmin: isSuperadmin,
        }
        
        if (!basicUser.is_approved && !basicUser.is_superadmin) {
          return false
        }
        
        setUser(basicUser)
        setIsAuthenticated(true)
        
        // Carregar dados adicionais em background
        loadUser(session.user, false).then((loadedUser) => {
          if (loadedUser) {
            if (loadedUser.unit_id || loadedUser.unit) {
              setUser(loadedUser)
            }
          }
        }).catch(() => {
          // Ignorar erros
        })
        
        return true
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
