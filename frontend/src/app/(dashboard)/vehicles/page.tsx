"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import VehiclesDataTable from "./data-table"
import { Loader2 } from "lucide-react"
import { VehicleForm } from "@/components/vehicles/VehicleForm"

export default function VehiclesPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)

  // Buscar todos os veículos
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      // Timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      )
      const queryPromise = supabase
        .from("vehicles")
        .select(`
          *,
          unit:units(id, number, block, floor),
          stakeholder:stakeholders(id, name, email)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
      
      const { data, error } = await Promise.race([
        queryPromise.then((result) => result),
        timeoutPromise
      ]) as any
      
      if (error) throw error
      
      // Processar dados relacionados
      return (data || []).map((vehicle: any) => ({
        ...vehicle,
        unit: Array.isArray(vehicle.unit) ? vehicle.unit[0] : vehicle.unit,
        stakeholder: Array.isArray(vehicle.stakeholder) ? vehicle.stakeholder[0] : vehicle.stakeholder,
      }))
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Mutation para deletar veículo (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from("vehicles")
        .update({ is_active: false })
        .eq("id", vehicleId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })

  const handleEdit = (vehicleId: string) => {
    setEditingVehicleId(vehicleId)
    setFormOpen(true)
  }

  const handleDelete = async (vehicleId: string) => {
    if (confirm("Deseja realmente excluir este veículo? Esta ação não pode ser desfeita.")) {
      try {
        await deleteMutation.mutateAsync(vehicleId)
      } catch (error: any) {
        console.error("Erro ao deletar veículo:", error)
        const errorMessage = error?.message || "Erro ao deletar veículo. Tente novamente."
        alert(errorMessage)
      }
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingVehicleId(null)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    handleFormClose()
  }

  const activeCount = vehicles?.length || 0

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-4">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2 stroke-1" />
          Novo Veículo
        </Button>
      </div>
      <div>
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-1 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-gray-400">Total de veículos ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Veículos */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Carregando veículos...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Veículos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os veículos cadastrados no condomínio. Use os filtros e ordenação
                para encontrar veículos específicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehiclesDataTable
                data={vehicles || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={deleteMutation.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <VehicleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicleId={editingVehicleId}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

