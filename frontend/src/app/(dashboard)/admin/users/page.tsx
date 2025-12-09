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

export default function AdminUsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { canApproveUsers } = useRBAC()
  const queryClient = useQueryClient()

  // Buscar todos os usuários (hooks devem ser chamados antes de qualquer return)
  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stakeholders")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: canApproveUsers(), // Só busca se tiver permissão
  })

  // Mutation para aprovar usuário
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("stakeholders")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id || null,
        })
        .eq("id", userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] })
    },
  })

  // Mutation para rejeitar usuário
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("stakeholders")
        .update({
          is_active: false,
        })
        .eq("id", userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] })
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
