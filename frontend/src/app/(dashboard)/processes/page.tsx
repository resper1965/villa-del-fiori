"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, Search, X, Loader2, FileText, Inbox, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useProcesses, useCreateProcess } from "@/lib/hooks/useProcesses"
import { ProcessForm } from "@/components/processes/ProcessForm"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/ui/empty-state"
import { Pagination } from "@/components/ui/pagination"

const categoryColors: Record<string, string> = {
  "Governança": "bg-info/10 text-info border-info/20",
  "Acesso e Segurança": "bg-destructive/10 text-destructive border-destructive/20",
  "Operação": "bg-warning/10 text-warning border-warning/20",
  "Áreas Comuns": "bg-success/10 text-success border-success/20",
  "Convivência": "bg-purple/10 text-purple border-purple/20",
  "Eventos": "bg-orange/10 text-orange border-orange/20",
  "Emergências": "bg-pink/10 text-pink border-pink/20",
}

// Mapear categorias do backend para frontend
const categoryMap: Record<string, string> = {
  governanca: "Governança",
  acesso_seguranca: "Acesso e Segurança",
  operacao: "Operação",
  areas_comuns: "Áreas Comuns",
  convivencia: "Convivência",
  eventos: "Eventos",
  emergencias: "Emergências",
}

const reverseCategoryMap: Record<string, string> = Object.fromEntries(
  Object.entries(categoryMap).map(([k, v]) => [v, k])
)

type SortOption = "name" | "category" | "status" | "created_at"
type SortDirection = "asc" | "desc"

const DEFAULT_ITEMS_PER_PAGE = 20
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100]

export default function ProcessesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
  const [formOpen, setFormOpen] = useState(false)
  const { toast } = useToast()
  
  // Paginação real implementada
  const { data, isLoading } = useProcesses({
    category: selectedCategory !== "all" ? reverseCategoryMap[selectedCategory] || selectedCategory : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    page: currentPage,
    page_size: itemsPerPage,
  })
  
  const createMutation = useCreateProcess()

  // Memoizar processos para evitar recriação a cada render
  const processes = useMemo(() => data?.items || [], [data?.items])
  const totalCount = data?.total || 0
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const categories = Object.values(categoryMap)
  const statuses = ["rascunho", "em_revisao", "aprovado", "rejeitado"]

  // Filtrar e ordenar processos localmente (apenas busca de texto, categoria e status já vêm filtrados do backend)
  const filteredProcesses = useMemo(() => {
    let filtered = processes.filter((process: any) => {
      // Apenas filtrar por busca de texto (categoria e status já vêm filtrados do backend)
      const matchesSearch = !searchQuery || 
        process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesSearch
    })

    // Ordenar processos
    filtered.sort((a: any, b: any) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || ""
          bValue = b.name?.toLowerCase() || ""
          break
        case "category":
          aValue = categoryMap[a.category] || a.category || ""
          bValue = categoryMap[b.category] || b.category || ""
          break
        case "status":
          aValue = a.status || ""
          bValue = b.status || ""
          break
        case "created_at":
          aValue = new Date(a.created_at || 0).getTime()
          bValue = new Date(b.created_at || 0).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [processes, searchQuery, sortBy, sortDirection])

  // Agrupar por categoria
  const groupedProcesses = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    filteredProcesses.forEach((process: any) => {
      const category = categoryMap[process.category] || process.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(process)
    })
    return grouped
  }, [filteredProcesses])

  const hasFilters = searchQuery !== "" || selectedCategory !== "all" || selectedStatus !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSortBy("name")
    setSortDirection("asc")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll para o topo da lista
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Resetar para primeira página
  }

  // Resetar página quando filtros mudarem
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleSort = (field: SortOption) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  const handleCreateProcess = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      toast({
        variant: "success",
        title: "Processo criado",
        description: "O processo foi criado com sucesso.",
      })
      setFormOpen(false)
    } catch (error: any) {
      console.error("Erro ao criar processo:", error)
      toast({
        variant: "destructive",
        title: "Erro ao criar processo",
        description: error?.message || "Ocorreu um erro ao criar o processo. Tente novamente.",
      })
    }
  }

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      {/* Botão de ação */}
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2 stroke-1" />
          Novo Processo
        </Button>
      </div>
      {/* Filtros */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-1" />
              <Input
                placeholder="Buscar processos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Status */}
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select 
              value={`${sortBy}-${sortDirection}`} 
              onValueChange={(value) => {
                const [field, dir] = value.split("-")
                setSortBy(field as SortOption)
                setSortDirection(dir as SortDirection)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                <SelectItem value="category-asc">Categoria (A-Z)</SelectItem>
                <SelectItem value="category-desc">Categoria (Z-A)</SelectItem>
                <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                <SelectItem value="created_at-desc">Mais recentes</SelectItem>
                <SelectItem value="created_at-asc">Mais antigos</SelectItem>
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
              <X className="h-3 w-3 mr-1" />
              Limpar Filtros
            </Button>
            <span className="text-xs text-muted-foreground">
              {filteredProcesses.length} processo(s) encontrado(s)
            </span>
          </div>
        )}
      </div>

      {/* Lista de processos - Bento Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(groupedProcesses).length === 0 ? (
          <Card className="card-elevated">
            <CardContent>
              <EmptyState
                icon={FileText}
                title={
                  hasFilters
                    ? "Nenhum processo encontrado"
                    : "Nenhum processo cadastrado"
                }
                description={
                  hasFilters
                    ? "Tente ajustar os filtros de busca para encontrar processos."
                    : "Comece criando seu primeiro processo clicando no botão acima."
                }
                action={
                  hasFilters ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  ) : (
                    <Button onClick={() => setFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Processo
                    </Button>
                  )
                }
              />
            </CardContent>
          </Card>
      ) : (
        Object.entries(groupedProcesses).map(([category, categoryProcesses]) => (
            <div key={category} className="mb-6">
              <h2 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {categoryProcesses.map((process: any) => (
                  <Card 
                    key={process.id} 
                    className="card-elevated cursor-pointer group"
                    onClick={() => router.push(`/processes/${process.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                            <FileText className="h-4 w-4 text-foreground group-hover:text-primary transition-colors stroke-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {process.name}
                            </CardTitle>
                            <div className="mt-1">
                              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                v{process.current_version_number || 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded border ${categoryColors[category]}`}>
                          {category}
                        </span>
                        <span className="text-xs text-muted-foreground font-light capitalize">
                          {process.status?.replace("_", " ") || "rascunho"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </div>
        ))
      )}

      {/* Paginação */}
      {!isLoading && totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showPageInfo={true}
        />
      )}

      <ProcessForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateProcess}
      />
    </div>
  )
}
