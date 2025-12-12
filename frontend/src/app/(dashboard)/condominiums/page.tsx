"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Building2 } from "lucide-react"
import { CondominiumForm } from "@/components/condominiums/CondominiumForm"
import { Condominium } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CondominiumsDataTable from "./data-table"

export default function CondominiumsPage() {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: condominiums = [], isLoading } = useQuery<Condominium[]>({
    queryKey: ["condominiums"],
    queryFn: async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      )
      const queryPromise = supabase
        .from("condominiums")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true })
      
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("condominiums")
        .update({ is_active: false })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["condominiums"] })
    },
  })

  const handleEdit = (id: string) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este condomínio?")) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error: any) {
        console.error("Erro ao deletar condomínio:", error)
        alert(error?.message || "Erro ao deletar condomínio. Tente novamente.")
      }
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["condominiums"] })
    handleFormClose()
  }

  const activeCount = condominiums?.length || 0

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4">
        <Button onClick={() => {
          setEditingId(null)
          setFormOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2 stroke-1" />
          Novo Condomínio
        </Button>
      </div>
      <div>
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-1 mb-6">
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Condomínios Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground">Total de condomínios ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Condomínios */}
        {isLoading ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando condomínios...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Lista de Condomínios</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os condomínios cadastrados. Use os filtros e ordenação
                para encontrar condomínios específicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CondominiumsDataTable
                data={condominiums || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={deleteMutation.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <CondominiumForm
        open={formOpen}
        onOpenChange={handleFormClose}
        condominiumId={editingId}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

