"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRBAC } from "@/lib/hooks/useRBAC"
import { supabase } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import UsersDataTable from "./data-table"
import { Loader2, Users } from "lucide-react"
import { updateUserAppMetadata } from "@/lib/api/user-metadata"
import { UserForm } from "@/components/users/UserForm"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminUsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { canApproveUsers } = useRBAC()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUserEmail, setEditingUserEmail] = useState<string>("")

  // Buscar todos os usuários do Supabase Auth (via view ou função)
  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // Timeout de 8 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Query timeout")), 8000)
      )
      
      const queryFn = async () => {
        // Buscar usuários do Supabase Auth via view
        const { data, error } = await supabase
          .from("auth_users_with_metadata")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          // Fallback: buscar da tabela stakeholders com join de unidades
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("stakeholders")
            .select(`
              *,
              unit:units(*),
              owner:stakeholders!stakeholders_owner_id_fkey(id, name, email)
            `)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
          
          if (fallbackError) throw fallbackError
          return (fallbackData || []).map((item: any) => ({
            ...item,
            unit: Array.isArray(item.unit) ? item.unit[0] : item.unit,
            owner: Array.isArray(item.owner) ? item.owner[0] : item.owner,
            auth_user_id: item.auth_user_id || item.id,
          }))
        }
        
        // Buscar unidades separadamente para os usuários da view
        const userIds = (data || []).map((u: any) => u.id)
        const { data: stakeholdersData } = await supabase
          .from("stakeholders")
          .select(`
            auth_user_id,
            unit_id,
            relationship_type,
            is_owner,
            is_resident,
            owner_id,
            phone,
            phone_secondary,
            whatsapp,
            has_whatsapp,
            unit:units(*),
            owner:stakeholders!stakeholders_owner_id_fkey(id, name, email)
          `)
          .in("auth_user_id", userIds)
        
        const stakeholdersMap = new Map()
        stakeholdersData?.forEach((s: any) => {
          stakeholdersMap.set(s.auth_user_id, {
            unit: Array.isArray(s.unit) ? s.unit[0] : s.unit,
            relationship_type: s.relationship_type,
            is_owner: s.is_owner,
            is_resident: s.is_resident,
            owner_id: s.owner_id,
            owner: Array.isArray(s.owner) ? s.owner[0] : s.owner,
            phone: s.phone,
            phone_secondary: s.phone_secondary,
            whatsapp: s.whatsapp,
            has_whatsapp: s.has_whatsapp,
          })
        })
        
        // Mapear dados da view para o formato esperado
        return (data || []).map((user: any) => {
          const stakeholderData = stakeholdersMap.get(user.id) || {}
          return {
            id: user.id,
            auth_user_id: user.id,
            name: user.name || user.email?.split("@")[0] || "Usuário",
            email: user.email,
            type: user.type || "morador",
            user_role: user.user_role || "resident",
            unit_id: stakeholderData.unit?.id || null,
            unit: stakeholderData.unit || null,
            relationship_type: stakeholderData.relationship_type || null,
            is_owner: stakeholderData.is_owner ?? false,
            is_resident: stakeholderData.is_resident ?? true,
            owner_id: stakeholderData.owner_id || null,
            owner: stakeholderData.owner || null,
            phone: stakeholderData.phone || null,
            phone_secondary: stakeholderData.phone_secondary || null,
            whatsapp: stakeholderData.whatsapp || null,
            has_whatsapp: stakeholderData.has_whatsapp || false,
            is_approved: user.is_approved || false,
            approved_at: user.approved_at,
            approved_by: user.approved_by,
            is_active: true,
            created_at: user.created_at,
          }
        })
      }
      
      return Promise.race([queryFn(), timeoutPromise]) as Promise<any>
    },
    enabled: canApproveUsers(), // Só busca se tiver permissão
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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

  // Mutation para deletar usuário
  const deleteMutation = useMutation({
    mutationFn: async (authUserId: string) => {
      // Desativar usuário (soft delete)
      await updateUserAppMetadata(authUserId, {
        is_approved: false,
      })

      // Desativar na tabela stakeholders
      await supabase
        .from("stakeholders")
        .update({
          is_active: false,
          is_approved: false,
        })
        .eq("auth_user_id", authUserId)

      // Nota: Deletar completamente do Supabase Auth requer Admin API
      // Por enquanto, apenas desativamos
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] })
    },
  })

  // Verificar permissão após hooks
  if (!canApproveUsers()) {
    router.push("/auth/unauthorized")
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

  const handleEdit = (userId: string, userEmail: string) => {
    setEditingUserId(userId)
    setEditingUserEmail(userEmail)
    setFormOpen(true)
  }

  const handleDelete = async (userId: string) => {
    if (confirm("Deseja deletar este usuário? Esta ação desativará o usuário permanentemente.")) {
      try {
        await deleteMutation.mutateAsync(userId)
      } catch (error) {
        console.error("Erro ao deletar usuário:", error)
        alert("Erro ao deletar usuário. Tente novamente.")
      }
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingUserId(null)
    setEditingUserEmail("")
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["all-users"] })
    handleFormClose()
  }

  const pendingCount = allUsers?.filter((u: any) => !u.is_approved && u.is_active).length || 0
  const approvedCount = allUsers?.filter((u: any) => u.is_approved && u.is_active).length || 0

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gerencie usuários do sistema e suas aprovações
        </p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2 stroke-1" />
          Novo Usuário
        </Button>
      </div>
      <div>
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
            <CardContent className="py-12">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (!allUsers || allUsers.length === 0) ? (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Users}
                title="Nenhum usuário cadastrado"
                description="Comece cadastrando o primeiro usuário do sistema. Usuários podem ser aprovados ou rejeitados após o cadastro."
                action={
                  <Button onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Usuário
                  </Button>
                }
              />
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
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        userId={editingUserId}
        userEmail={editingUserEmail}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
