"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Home } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import UnitsDataTable from "./data-table"
import { Loader2 } from "lucide-react"
import { UnitForm } from "@/components/units/UnitForm"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function UnitsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)

  // Buscar todas as unidades
  const { data: units, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      // Timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      )
      const queryPromise = supabase
        .from("units")
        .select("*")
        .eq("is_active", true)
        .order("number", { ascending: true })
      
      const { data, error } = await Promise.race([
        queryPromise.then((result) => result),
        timeoutPromise
      ]) as any
      
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Mutation para deletar unidade (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (unitId: string) => {
      const { error } = await supabase
        .from("units")
        .update({ is_active: false })
        .eq("id", unitId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
    },
  })

  const handleEdit = (unitId: string) => {
    setEditingUnitId(unitId)
    setFormOpen(true)
  }

  const handleDelete = async (unitId: string) => {
    // Verificar se há usuários ou veículos associados
    try {
      const { data: stakeholders } = await supabase
        .from("stakeholders")
        .select("id")
        .eq("unit_id", unitId)
        .eq("is_active", true)
        .limit(1)

      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id")
        .eq("unit_id", unitId)
        .eq("is_active", true)
        .limit(1)

      if (stakeholders && stakeholders.length > 0) {
        alert("Não é possível excluir esta unidade. Existem usuários associados a ela. Remova os usuários primeiro ou desative a unidade.")
        return
      }

      if (vehicles && vehicles.length > 0) {
        alert("Não é possível excluir esta unidade. Existem veículos associados a ela. Remova os veículos primeiro ou desative a unidade.")
        return
      }

      if (confirm("Deseja realmente excluir esta unidade? Esta ação não pode ser desfeita.")) {
        try {
          await deleteMutation.mutateAsync(unitId)
        } catch (error) {
          console.error("Erro ao deletar unidade:", error)
          alert("Erro ao deletar unidade. Tente novamente.")
        }
      }
    } catch (error) {
      console.error("Erro ao verificar associações:", error)
      alert("Erro ao verificar associações. Tente novamente.")
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingUnitId(null)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["units"] })
    handleFormClose()
  }

  const handleViewDetails = (unitId: string) => {
    router.push(`/units/${unitId}`)
  }

  const activeCount = units?.length || 0

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push("/units/new")}
          >
            Cadastro Completo
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2 stroke-1" />
            Nova Unidade
          </Button>
        </div>
      </div>
      <div>
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-1 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unidades Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground">Total de unidades ativas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Unidades */}
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
        ) : (!units || units.length === 0) ? (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Unidades</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as unidades cadastradas no condomínio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Home}
                title="Nenhuma unidade cadastrada"
                description="Comece cadastrando a primeira unidade do condomínio. Você pode cadastrar unidades individualmente ou usar o cadastro completo."
                action={
                  <div className="flex gap-2">
                    <Button onClick={() => setFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Unidade
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/units/new")}>
                      Cadastro Completo
                    </Button>
                  </div>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Unidades</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as unidades cadastradas no condomínio. Use os filtros e ordenação
                para encontrar unidades específicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnitsDataTable
                data={units || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                isLoading={deleteMutation.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <UnitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        unitId={editingUnitId}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

