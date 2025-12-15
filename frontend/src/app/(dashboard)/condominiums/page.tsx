"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Building2, Edit, MapPin, Phone, Mail, FileText } from "lucide-react"
import { CondominiumForm } from "@/components/condominiums/CondominiumForm"
import { Condominium } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"

export default function CondominiumsPage() {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Buscar apenas o condomínio ativo (único)
  const { data: condominium, isLoading } = useQuery<Condominium | null>({
    queryKey: ["condominium"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("condominiums")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
      
      if (error && error.code !== "PGRST116") {
        throw error
      }
      return data || null
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const handleEdit = () => {
    if (condominium) {
      setEditingId(condominium.id)
      setFormOpen(true)
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["condominium"] })
    queryClient.invalidateQueries({ queryKey: ["condominiums"] })
    handleFormClose()
    toast({
      variant: "success",
      title: "Condomínio atualizado",
      description: "As informações do condomínio foram salvas com sucesso.",
    })
  }

  const formatAddress = (condominium: Condominium) => {
    const parts = []
    if (condominium.address_street) {
      parts.push(condominium.address_street)
      if (condominium.address_number) {
        parts.push(`nº ${condominium.address_number}`)
      }
      if (condominium.address_complement) {
        parts.push(condominium.address_complement)
      }
    }
    if (condominium.address_neighborhood) {
      parts.push(condominium.address_neighborhood)
    }
    if (condominium.address_city) {
      parts.push(condominium.address_city)
    }
    if (condominium.address_state) {
      parts.push(condominium.address_state)
    }
    if (condominium.address_zipcode) {
      parts.push(`CEP: ${condominium.address_zipcode}`)
    }
    return parts.length > 0 ? parts.join(", ") : "Endereço não informado"
  }

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Condomínio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A aplicação é mono-tenant. Apenas um condomínio pode estar cadastrado por vez.
          </p>
        </div>
        {condominium && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2 stroke-1" />
            Editar Condomínio
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="card-elevated">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando informações do condomínio...</p>
          </CardContent>
        </Card>
      ) : !condominium ? (
        <Card className="card-elevated">
          <CardContent>
            <EmptyState
              icon={Building2}
              title="Nenhum condomínio cadastrado"
              description="Para começar a usar o sistema, é necessário cadastrar o condomínio. Esta é uma etapa obrigatória."
              action={
                <Button onClick={() => router.push("/setup")}>
                  Cadastrar Condomínio
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Card Principal do Condomínio */}
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{condominium.name}</CardTitle>
                    {condominium.cnpj && (
                      <CardDescription className="mt-1">
                        CNPJ: {condominium.cnpj}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2 stroke-1" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações de Contato */}
              {(condominium.phone || condominium.email) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {condominium.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Telefone</p>
                        <p className="text-sm text-muted-foreground">{condominium.phone}</p>
                      </div>
                    </div>
                  )}
                  {condominium.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">E-mail</p>
                        <p className="text-sm text-muted-foreground">{condominium.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Endereço */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Endereço</p>
                  <p className="text-sm text-muted-foreground">{formatAddress(condominium)}</p>
                </div>
              </div>

              {/* Descrição */}
              {condominium.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Descrição</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {condominium.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Características */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
                {condominium.total_units !== null && (
                  <div>
                    <p className="text-sm font-medium">Unidades</p>
                    <p className="text-2xl font-bold">{condominium.total_units}</p>
                  </div>
                )}
                {condominium.total_floors !== null && (
                  <div>
                    <p className="text-sm font-medium">Andares</p>
                    <p className="text-2xl font-bold">{condominium.total_floors}</p>
                  </div>
                )}
                {condominium.total_blocks !== null && (
                  <div>
                    <p className="text-sm font-medium">Blocos</p>
                    <p className="text-2xl font-bold">{condominium.total_blocks}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Instalações</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {condominium.has_elevator && (
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        Elevador
                      </span>
                    )}
                    {condominium.has_pool && (
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        Piscina
                      </span>
                    )}
                    {condominium.has_gym && (
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        Academia
                      </span>
                    )}
                    {condominium.has_party_room && (
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        Salão de Festas
                      </span>
                    )}
                    {!condominium.has_elevator && !condominium.has_pool && !condominium.has_gym && !condominium.has_party_room && (
                      <span className="text-xs text-muted-foreground">Nenhuma informada</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CondominiumForm
        open={formOpen}
        onOpenChange={handleFormClose}
        condominiumId={editingId}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

