"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRBAC } from "@/lib/hooks/useRBAC"
import { supabase } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import UsersDataTable from "./data-table"
import { Loader2 } from "lucide-react"
import { updateUserAppMetadata } from "@/lib/api/user-metadata"

export default function AdminUsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { canApproveUsers } = useRBAC()
  const queryClient = useQueryClient()

  // Buscar todos os usuários do Supabase Auth (via view ou função)
  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // Buscar usuários do Supabase Auth via view
      const { data, error } = await supabase
        .from("auth_users_with_metadata")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        // Fallback: buscar da tabela stakeholders se a view não existir
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("stakeholders")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
        
        if (fallbackError) throw fallbackError
        return fallbackData || []
      }
      
      // Mapear dados da view para o formato esperado
      return (data || []).map((user: any) => ({
        id: user.id,
        auth_user_id: user.id,
        name: user.name || user.email?.split("@")[0] || "Usuário",
        email: user.email,
        type: user.type || "morador",
        user_role: user.user_role || "resident",
        is_approved: user.is_approved || false,
        approved_at: user.approved_at,
        approved_by: user.approved_by,
        is_active: true,
        created_at: user.created_at,
      }))
    },
    enabled: canApproveUsers(), // Só busca se tiver permissão
  })

  // Mutation para aprovar usuário (atualiza app_metadata no Supabase Auth)
  const approveMutation = useMutation({
    mutationFn: async (authUserId: string) => {
      // Atualizar app_metadata via Edge Function
      await updateUserAppMetadata(authUserId, {
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: currentUser?.id || undefined,
      })

      // Também atualizar na tabela stakeholders se existir (para sincronização)
      try {
        await supabase
          .from("stakeholders")
          .update({
            is_approved: true,
            approved_at: new Date().toISOString(),
            approved_by: currentUser?.id || null,
          })
          .eq("auth_user_id", authUserId)
      } catch (err) {
        // Não crítico se falhar - app_metadata é a fonte da verdade
        console.warn("Erro ao atualizar stakeholders:", err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] })
      // Forçar refresh da sessão para atualizar app_metadata
      supabase.auth.refreshSession()
    },
  })

  // Mutation para rejeitar usuário
  const rejectMutation = useMutation({
    mutationFn: async (authUserId: string) => {
      // Atualizar app_metadata para não aprovado
      await updateUserAppMetadata(authUserId, {
        is_approved: false,
      })

      // Também atualizar na tabela stakeholders se existir
      try {
        await supabase
          .from("stakeholders")
          .update({
            is_active: false,
            is_approved: false,
          })
          .eq("auth_user_id", authUserId)
      } catch (err) {
        console.warn("Erro ao atualizar stakeholders:", err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] })
      supabase.auth.refreshSession()
    },
  })

  // Verificar permissão após hooks
  if (!canApproveUsers()) {
    router.push("/dashboard")
    return null
  }

  const handleApprove = async (userId: string) => {
    if (confirm("Deseja aprovar este usuário?")) {
      try {
        await approveMutation.mutateAsync(userId)
      } catch (error) {
        console.error("Erro ao aprovar usuário:", error)
        alert("Erro ao aprovar usuário. Tente novamente.")
      }
    }
  }

  const handleReject = async (userId: string) => {
    if (confirm("Deseja rejeitar este usuário? Esta ação não pode ser desfeita.")) {
      try {
        await rejectMutation.mutateAsync(userId)
      } catch (error) {
        console.error("Erro ao rejeitar usuário:", error)
        alert("Erro ao rejeitar usuário. Tente novamente.")
      }
    }
  }

  const pendingCount = allUsers?.filter((u) => !u.is_approved && u.is_active).length || 0
  const approvedCount = allUsers?.filter((u) => u.is_approved && u.is_active).length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center justify-between px-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Gerenciar Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie usuários do sistema e suas aprovações
          </p>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Com acesso ao sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Usuários */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando usuários...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários do sistema. Use os filtros e ordenação
                para encontrar usuários específicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersDataTable
                data={allUsers || []}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={approveMutation.isPending || rejectMutation.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
