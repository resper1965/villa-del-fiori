"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, X, Loader2, Users, Phone, Mail, Building2, AlertCircle, Edit, Trash2 } from "lucide-react"
import { useEntities, useDeleteEntity } from "@/lib/hooks/useEntities"
import { EntityType, EntityCategory, EntityTypeLabels, EntityCategoryLabels, CategoriesByType } from "@/types/entity"
import { EntityForm } from "@/components/entities/EntityForm"

export default function EntitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<string | null>(null)

  const deleteMutation = useDeleteEntity()

  const { data, isLoading, error } = useEntities({
    type: selectedType !== "all" ? selectedType as EntityType : undefined,
    category: selectedCategory !== "all" ? selectedCategory as EntityCategory : undefined,
    search: searchQuery || undefined,
    page: 1,
    page_size: 100,
  })

  const entities = data?.items || []
  const hasFilters = searchQuery !== "" || selectedType !== "all" || selectedCategory !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("all")
    setSelectedCategory("all")
  }

  const handleEdit = (id: string) => {
    setEditingEntity(id)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja desativar esta entidade?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingEntity(null)
  }

  const getTypeIcon = (type: EntityType) => {
    switch (type) {
      case EntityType.PESSOA:
        return Users
      case EntityType.EMPRESA:
        return Building2
      case EntityType.SERVICO_EMERGENCIA:
        return AlertCircle
      default:
        return Building2
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-foreground">
          Entidades
        </h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2 stroke-1" />
          Nova Entidade
        </Button>
      </div>
      <div className="px-1 sm:px-2 md:px-3 py-2">
        {/* Filtros */}
        <div className="mb-3 space-y-2">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-1" />
              <Input
                placeholder="Buscar entidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Tipo */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(EntityTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {selectedType !== "all" && CategoriesByType[selectedType as EntityType]?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {EntityCategoryLabels[cat]}
                  </SelectItem>
                ))}
                {selectedType === "all" && Object.entries(EntityCategoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão limpar filtros */}
          {hasFilters && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1 stroke-1" />
                Limpar Filtros
              </Button>
              <span className="text-xs text-muted-foreground">
                {entities.length} entidade(s) encontrada(s)
              </span>
            </div>
          )}
        </div>

        {/* Lista de entidades */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground stroke-1" />
              <p className="text-muted-foreground">Carregando entidades...</p>
            </CardContent>
          </Card>
        ) : entities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma entidade encontrada com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {entities.map((entity) => {
              const TypeIcon = getTypeIcon(entity.type)
              return (
                <Card
                  key={entity.id}
                  className={`${!entity.is_active ? "opacity-50" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-md bg-muted">
                          <TypeIcon className="h-4 w-4 text-foreground stroke-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-light text-gray-200 line-clamp-2">
                            {entity.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {EntityTypeLabels[entity.type]}
                            {entity.category && ` • ${EntityCategoryLabels[entity.category]}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(entity.id)}
                        >
                          <Edit className="h-4 w-4 stroke-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(entity.id)}
                        >
                          <Trash2 className="h-4 w-4 stroke-1" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {entity.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 stroke-1" />
                        <span>{entity.phone}</span>
                      </div>
                    )}
                    {entity.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 stroke-1" />
                        <span className="truncate">{entity.email}</span>
                      </div>
                    )}
                    {entity.contact_person && (
                      <div className="text-xs text-muted-foreground">
                        Contato: {entity.contact_person}
                      </div>
                    )}
                    {entity.emergency_phone && (
                      <div className="text-xs text-red-400">
                        Emergência: {entity.emergency_phone}
                      </div>
                    )}
                    {entity.meeting_point && (
                      <div className="text-xs text-muted-foreground">
                        Ponto de encontro: {entity.meeting_point}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <EntityForm
        open={formOpen}
        onOpenChange={handleFormClose}
        entityId={editingEntity}
      />
    </div>
  )
}

