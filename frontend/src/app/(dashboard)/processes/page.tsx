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
import { Plus, Search, X } from "lucide-react"
import { processesData } from "@/data/processes"

const categoryColors: Record<string, string> = {
  "Governança": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Acesso e Segurança": "bg-red-500/10 text-red-400 border-red-500/20",
  "Operação": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Áreas Comuns": "bg-green-500/10 text-green-400 border-green-500/20",
  "Convivência": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Eventos": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Emergências": "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export default function ProcessesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const categories = Array.from(new Set(processesData.map(p => p.category)))
  const statuses = Array.from(new Set(processesData.map(p => p.status)))

  // Filtrar processos
  const filteredProcesses = useMemo(() => {
    return processesData.filter((process) => {
      // Filtro de busca (nome ou descrição)
      const matchesSearch =
        searchQuery === "" ||
        process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.description?.toLowerCase().includes(searchQuery.toLowerCase())

      // Filtro de categoria
      const matchesCategory = selectedCategory === "all" || process.category === selectedCategory

      // Filtro de status
      const matchesStatus = selectedStatus === "all" || process.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, selectedCategory, selectedStatus])

  // Agrupar por categoria
  const groupedProcesses = useMemo(() => {
    const grouped: Record<string, typeof processesData> = {}
    filteredProcesses.forEach((process) => {
      if (!grouped[process.category]) {
        grouped[process.category] = []
      }
      grouped[process.category].push(process)
    })
    return grouped
  }, [filteredProcesses])

  const hasFilters = searchQuery !== "" || selectedCategory !== "all" || selectedStatus !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("all")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[73px] border-b border-border flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-foreground">
          Processos
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Processo
        </Button>
      </div>
      <div className="p-6">
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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

        {/* Lista de processos */}
        {Object.keys(groupedProcesses).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum processo encontrado com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedProcesses).map(([category, categoryProcesses]) => (
            <div key={category} className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProcesses.map((process) => {
                  const Icon = process.icon
          return (
            <div key={category} className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProcesses.map((process) => {
                  const Icon = process.icon
                  return (
                    <Card 
                      key={process.id} 
                      className="hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/processes/${process.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-muted">
                              <Icon className="h-4 w-4 text-foreground" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium text-foreground line-clamp-2">
                                {process.name}
                              </CardTitle>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded border ${categoryColors[category]}`}>
                            {category}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {process.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


