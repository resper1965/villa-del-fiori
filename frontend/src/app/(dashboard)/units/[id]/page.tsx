"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Edit, Home, Users, Car, Loader2, Heart, Briefcase } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Unit, Stakeholder, Vehicle } from "@/types"
import { Badge } from "@/components/ui/badge"
import { UserForm } from "@/components/users/UserForm"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { UnitForm } from "@/components/units/UnitForm"
import { PetForm } from "@/components/pets/PetForm"
import { Pet } from "@/types"

export default function UnitDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const unitId = params.id as string

  const [userFormOpen, setUserFormOpen] = useState(false)
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false)
  const [petFormOpen, setPetFormOpen] = useState(false)
  const [unitFormOpen, setUnitFormOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUserEmail, setEditingUserEmail] = useState<string>("")
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [editingPetId, setEditingPetId] = useState<string | null>(null)

  // Buscar dados da unidade
  const { data: unit, isLoading: isLoadingUnit } = useQuery<Unit>({
    queryKey: ["unit", unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("id", unitId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!unitId,
  })

  // Buscar proprietários da unidade
  const { data: owners = [], isLoading: isLoadingOwners } = useQuery<Stakeholder[]>({
    queryKey: ["unit-owners", unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stakeholders")
        .select(`
          *,
          owner:stakeholders!stakeholders_owner_id_fkey(id, name, email)
        `)
        .eq("unit_id", unitId)
        .eq("is_owner", true)
        .eq("is_active", true)
        .order("name", { ascending: true })

      if (error) throw error
      return (data || []).map((item: any) => ({
        ...item,
        owner: Array.isArray(item.owner) ? item.owner[0] : item.owner,
      }))
    },
    enabled: !!unitId,
  })

  // Buscar moradores da unidade (incluindo proprietários que moram e locatários)
  const { data: residents = [], isLoading: isLoadingResidents } = useQuery<Stakeholder[]>({
    queryKey: ["unit-residents", unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stakeholders")
        .select(`
          *,
          owner:stakeholders!stakeholders_owner_id_fkey(id, name, email)
        `)
        .eq("unit_id", unitId)
        .eq("is_resident", true)
        .eq("is_active", true)
        .order("is_owner", { ascending: false })
        .order("name", { ascending: true })

      if (error) throw error
      return (data || []).map((item: any) => ({
        ...item,
        owner: Array.isArray(item.owner) ? item.owner[0] : item.owner,
      }))
    },
    enabled: !!unitId,
  })

  // Buscar pets da unidade
  const { data: pets = [], isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ["unit-pets", unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select(`
          *,
          owner:stakeholders(id, name, email)
        `)
        .eq("unit_id", unitId)
        .eq("is_active", true)
        .order("name", { ascending: true })

      if (error) throw error
      return (data || []).map((item: any) => ({
        ...item,
        owner: Array.isArray(item.owner) ? item.owner[0] : item.owner,
      }))
    },
    enabled: !!unitId,
  })

  // Buscar funcionários da unidade
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Stakeholder[]>({
    queryKey: ["unit-employees", unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stakeholders")
        .select("*")
        .eq("employee_unit_id", unitId)
        .eq("is_employee", true)
        .eq("is_active", true)
        .order("name", { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!unitId,
  })

  // Buscar veículos da unidade
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["unit-vehicles", unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          unit:units(*),
          stakeholder:stakeholders(id, name, email)
        `)
        .eq("unit_id", unitId)
        .eq("is_active", true)
        .order("license_plate", { ascending: true })

      if (error) throw error
      return (data || []).map((item: any) => ({
        ...item,
        unit: Array.isArray(item.unit) ? item.unit[0] : item.unit,
        stakeholder: Array.isArray(item.stakeholder) ? item.stakeholder[0] : item.stakeholder,
      }))
    },
    enabled: !!unitId,
  })

  const getRelationshipTypeLabel = (stakeholder: Stakeholder) => {
    if (stakeholder.relationship_type === "proprietario_morador") {
      return { label: "Proprietário/Morador", className: "bg-info/10 text-info border-info/20" }
    } else if (stakeholder.relationship_type === "proprietario") {
      return { label: "Proprietário", className: "bg-purple/10 text-purple border-purple/20" }
    } else if (stakeholder.relationship_type === "morador") {
      return { label: "Locatário", className: "bg-success/10 text-success border-success/20" }
    }
    // Fallback para dados antigos
    if (stakeholder.is_owner && stakeholder.is_resident) {
      return { label: "Proprietário/Morador", className: "bg-info/10 text-info border-info/20" }
    } else if (stakeholder.is_owner) {
      return { label: "Proprietário", className: "bg-purple/10 text-purple border-purple/20" }
    } else if (stakeholder.is_resident) {
      return { label: "Morador", className: "bg-success/10 text-success border-success/20" }
    }
    return { label: "-", className: "" }
  }

  if (isLoadingUnit) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <div className="text-muted-foreground font-light">Carregando unidade...</div>
        </div>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground font-light">Unidade não encontrada</div>
          <Button onClick={() => router.push("/units")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Unidades
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="h-[73px] border-b border-border/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/units")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => router.push("/cadastros")}
              >
                Cadastros
              </Button>
              <span className="text-muted-foreground text-xs">/</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => router.push("/units")}
              >
                Unidades
              </Button>
              <span className="text-muted-foreground text-xs">/</span>
              <span className="text-xs text-muted-foreground">Unidade {unit.number}</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              Unidade {unit.number}
            </h1>
            {unit.block && (
              <p className="text-sm text-muted-foreground">
                Bloco {unit.block}
                {unit.floor && ` • ${unit.floor}º andar`}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setUnitFormOpen(true)} variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Editar Unidade
        </Button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Informações da Unidade */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Informações da Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Número</p>
                <p className="text-foreground font-medium">{unit.number}</p>
              </div>
              {unit.block && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bloco</p>
                  <p className="text-foreground font-medium">{unit.block}</p>
                </div>
              )}
              {unit.floor && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Andar</p>
                  <p className="text-foreground font-medium">{unit.floor}º</p>
                </div>
              )}
              {unit.area && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Área</p>
                  <p className="text-foreground font-medium">{unit.area} m²</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vagas de Garagem</p>
                <p className="text-foreground font-medium">{unit.parking_spots || 0}</p>
              </div>
              {unit.description && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                  <p className="text-foreground">{unit.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estrutura em Árvore */}
        <div className="space-y-6">
          {/* Proprietários */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Proprietários
                </CardTitle>
                <CardDescription>
                  Proprietários da unidade {unit.number}
                </CardDescription>
              </div>
              <Button onClick={() => setUserFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Proprietário
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingOwners ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando proprietários...</p>
                </div>
              ) : owners.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum proprietário cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {owners.map((owner) => {
                    const typeInfo = getRelationshipTypeLabel(owner)
                    return (
                      <div
                        key={owner.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <p className="text-foreground font-medium">{owner.name}</p>
                              <p className="text-sm text-muted-foreground">{owner.email}</p>
                              {owner.phone && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📞 {owner.phone}
                                  {owner.has_whatsapp && owner.whatsapp === owner.phone && (
                                    <span className="ml-1 text-success">💬</span>
                                  )}
                                </p>
                              )}
                              {owner.whatsapp && owner.whatsapp !== owner.phone && (
                                <p className="text-xs text-muted-foreground">
                                  💬 WA: {owner.whatsapp}
                                </p>
                              )}
                            </div>
                            {owner.relationship_type && (
                              <Badge variant="outline" className={`${typeInfo.className}`}>
                                {typeInfo.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUserId(owner.id)
                            setEditingUserEmail(owner.email)
                            setUserFormOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moradores */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Moradores
                </CardTitle>
                <CardDescription>
                  Moradores da unidade {unit.number} (incluindo proprietários que moram e locatários)
                </CardDescription>
              </div>
              <Button onClick={() => setUserFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Morador
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingResidents ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando moradores...</p>
                </div>
              ) : residents.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum morador cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {residents.map((resident) => {
                    const typeInfo = getRelationshipTypeLabel(resident)
                    return (
                      <div
                        key={resident.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <p className="text-foreground font-medium">{resident.name}</p>
                              <p className="text-sm text-muted-foreground">{resident.email}</p>
                              {resident.phone && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📞 {resident.phone}
                                  {resident.has_whatsapp && resident.whatsapp === resident.phone && (
                                    <span className="ml-1 text-success">💬</span>
                                  )}
                                </p>
                              )}
                              {resident.whatsapp && resident.whatsapp !== resident.phone && (
                                <p className="text-xs text-muted-foreground">
                                  💬 WA: {resident.whatsapp}
                                </p>
                              )}
                            </div>
                            {resident.relationship_type && (
                              <Badge variant="outline" className={typeInfo.className}>
                                {typeInfo.label}
                              </Badge>
                            )}
                          </div>
                          {resident.relationship_type === "morador" && resident.owner && (
                            <p className="text-xs text-muted-foreground">
                              Proprietário: {resident.owner.name} ({resident.owner.email})
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUserId(resident.id)
                            setEditingUserEmail(resident.email)
                            setUserFormOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Veículos */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Veículos
                </CardTitle>
                <CardDescription>
                  Veículos cadastrados para a unidade {unit.number}
                </CardDescription>
              </div>
              <Button onClick={() => setVehicleFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Veículo
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingVehicles ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando veículos...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum veículo cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30"
                    >
                      <div>
                        <p className="text-foreground font-medium">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">Placa: {vehicle.license_plate}</p>
                          {vehicle.color && (
                            <p className="text-sm text-muted-foreground">Cor: {vehicle.color}</p>
                          )}
                          {vehicle.year && (
                            <p className="text-sm text-muted-foreground">Ano: {vehicle.year}</p>
                          )}
                        </div>
                        {vehicle.stakeholder && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Proprietário: {vehicle.stakeholder.name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingVehicleId(vehicle.id)
                          setVehicleFormOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pets */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Pets
                </CardTitle>
                <CardDescription>
                  Pets cadastrados para a unidade {unit.number}
                </CardDescription>
              </div>
              <Button onClick={() => setPetFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pet
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPets ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando pets...</p>
                </div>
              ) : pets.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum pet cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30"
                    >
                      <div>
                        <p className="text-foreground font-medium">{pet.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground capitalize">{pet.species}</p>
                          {pet.breed && (
                            <p className="text-sm text-muted-foreground">Raça: {pet.breed}</p>
                          )}
                          {pet.size && (
                            <p className="text-sm text-muted-foreground capitalize">Porte: {pet.size}</p>
                          )}
                        </div>
                        {pet.owner && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Proprietário: {pet.owner.name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPetId(pet.id)
                          setPetFormOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funcionários */}
          {employees.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Funcionários
                  </CardTitle>
                  <CardDescription>
                    Funcionários que trabalham nesta unidade
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingEmployees ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Carregando funcionários...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30"
                      >
                        <div>
                          <p className="text-foreground font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                          {employee.employee_role && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Função: {employee.employee_role}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUserId(employee.id)
                            setEditingUserEmail(employee.email)
                            setUserFormOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Forms */}
      <UserForm
        open={userFormOpen}
        onOpenChange={(open) => {
          setUserFormOpen(open)
          if (!open) {
            setEditingUserId(null)
            setEditingUserEmail("")
          }
        }}
        userId={editingUserId}
        userEmail={editingUserEmail}
        defaultUnitId={unitId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["unit-owners", unitId] })
          queryClient.invalidateQueries({ queryKey: ["unit-residents", unitId] })
          queryClient.invalidateQueries({ queryKey: ["all-users"] })
          setUserFormOpen(false)
          setEditingUserId(null)
          setEditingUserEmail("")
        }}
      />

      <VehicleForm
        open={vehicleFormOpen}
        onOpenChange={(open) => {
          setVehicleFormOpen(open)
          if (!open) {
            setEditingVehicleId(null)
          }
        }}
        vehicleId={editingVehicleId}
        defaultUnitId={unitId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["unit-vehicles", unitId] })
          setVehicleFormOpen(false)
          setEditingVehicleId(null)
        }}
      />

      <PetForm
        open={petFormOpen}
        onOpenChange={(open) => {
          setPetFormOpen(open)
          if (!open) {
            setEditingPetId(null)
          }
        }}
        petId={editingPetId}
        defaultUnitId={unitId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["unit-pets", unitId] })
          setPetFormOpen(false)
          setEditingPetId(null)
        }}
      />

      <UnitForm
        open={unitFormOpen}
        onOpenChange={setUnitFormOpen}
        unitId={unitId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["unit", unitId] })
          queryClient.invalidateQueries({ queryKey: ["units"] })
          setUnitFormOpen(false)
        }}
      />
    </div>
  )
}

