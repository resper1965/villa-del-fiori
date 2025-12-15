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
        // Buscar TODOS os usuários de auth.users via RPC ou função
        // Como não temos acesso direto a auth.users via PostgREST, vamos buscar de stakeholders
        // e também garantir que usuários sem stakeholder apareçam
        
        // Primeiro, buscar todos os stakeholders (incluindo admin)
        const { data: stakeholdersData, error: stakeholdersError } = await supabase
          .from("stakeholders")
          .select(`
            *,
            unit:units(*),
            owner:stakeholders!owner_id(id, name, email)
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
        
        if (stakeholdersError) throw stakeholdersError
        
        // Mapear stakeholders para o formato esperado
        const stakeholdersMap = new Map()
        const result: any[] = []
        
        // Buscar owners separadamente se necessário
        const ownerIds = stakeholdersData?.filter((s: any) => s.owner_id).map((s: any) => s.owner_id) || []
        const ownersMap = new Map()
        
        if (ownerIds.length > 0) {
          const { data: ownersData } = await supabase
            .from("stakeholders")
            .select("id, name, email")
            .in("id", ownerIds)
          
          ownersData?.forEach((owner: any) => {
            ownersMap.set(owner.id, owner)
          })
        }
        
        stakeholdersData?.forEach((s: any) => {
          const userData = {
            id: s.auth_user_id || s.id,
            auth_user_id: s.auth_user_id || s.id,
            name: s.name || s.email?.split("@")[0] || "Usuário",
            email: s.email,
            type: s.type || "morador",
            user_role: s.user_role || "resident",
            unit_id: Array.isArray(s.unit) ? s.unit[0]?.id : s.unit?.id || null,
            unit: Array.isArray(s.unit) ? s.unit[0] : s.unit || null,
            relationship_type: s.relationship_type || null,
            is_owner: s.is_owner ?? false,
            is_resident: s.is_resident ?? true,
            owner_id: s.owner_id || null,
            owner: s.owner_id ? ownersMap.get(s.owner_id) || null : null,
            phone: s.phone || null,
            phone_secondary: s.phone_secondary || null,
            whatsapp: s.whatsapp || null,
            has_whatsapp: s.has_whatsapp || false,
            is_approved: s.is_approved ?? false,
            approved_at: s.approved_at || null,
            approved_by: s.approved_by || null,
            is_active: s.is_active ?? true,
            created_at: s.created_at,
          }
          
          if (s.auth_user_id) {
            stakeholdersMap.set(s.auth_user_id, userData)
          }
          result.push(userData)
        })
        
        // Buscar usuários de auth.users que não estão em stakeholders
        // Usar uma função RPC se disponível, ou buscar via Admin API
        // Por enquanto, retornamos apenas os stakeholders (que incluem admin)
        // O admin DEVE estar na tabela stakeholders para aparecer na lista
        
        return result
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
