"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Truck } from "lucide-react"
import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { Supplier } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SuppliersDataTable from "./data-table"

export default function SuppliersPage() {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      )
      const queryPromise = supabase
        .from("suppliers")
        .select(`
          *,
          condominium:condominiums(id, name)
        `)
        .eq("is_active", true)
        .order("name", { ascending: true })
      
      const { data, error } = await Promise.race([
        queryPromise.then((result) => result),
        timeoutPromise
      ]) as any
      
      if (error) throw error
      return (data || []).map((item: any) => ({
        ...item,
        condominium: Array.isArray(item.condominium) ? item.condominium[0] : item.condominium,
      }))
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .update({ is_active: false })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })

  const handleEdit = (id: string) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error: any) {
        console.error("Erro ao deletar fornecedor:", error)
        alert(error?.message || "Erro ao deletar fornecedor. Tente novamente.")
      }
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    handleFormClose()
  }

  const activeCount = suppliers?.length || 0

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4 flex items-center gap-2">
        <Button onClick={() => {
          setEditingId(null)
          setFormOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2 stroke-1" />
          Novo Fornecedor
        </Button>
      </div>
      <div>
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-1 mb-6">
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-gray-400">Total de fornecedores ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Fornecedores */}
        {isLoading ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Carregando fornecedores...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Lista de Fornecedores</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os fornecedores cadastrados. Use os filtros e ordenação
                para encontrar fornecedores específicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuppliersDataTable
                data={suppliers || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={deleteMutation.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <SupplierForm
        open={formOpen}
        onOpenChange={handleFormClose}
        supplierId={editingId}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

