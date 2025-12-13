"use client"

import * as React from "react"
import { X, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export interface FilterConfig {
  id: string
  label: string
  type: "text" | "select" | "number" | "date"
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface AdvancedFiltersProps {
  filters: FilterConfig[]
  activeFilters: Record<string, string>
  onFilterChange: (filterId: string, value: string) => void
  onClearFilters: () => void
  globalSearch: string
  onGlobalSearchChange: (value: string) => void
  globalSearchPlaceholder?: string
}

export function AdvancedFilters({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  globalSearch,
  onGlobalSearchChange,
  globalSearchPlaceholder = "Buscar...",
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const activeFiltersCount = Object.values(activeFilters).filter(v => v && v !== "").length

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Busca Global */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={globalSearchPlaceholder}
          value={globalSearch}
          onChange={(e) => onGlobalSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtros Avançados */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avançados</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearFilters()
                    setIsOpen(false)
                  }}
                  className="h-8 text-xs"
                >
                  Limpar todos
                </Button>
              )}
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label className="text-sm font-medium">{filter.label}</Label>
                  {filter.type === "text" && (
                    <Input
                      placeholder={filter.placeholder || `Filtrar por ${filter.label.toLowerCase()}`}
                      value={activeFilters[filter.id] || ""}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    />
                  )}
                  {filter.type === "select" && filter.options && (
                    <Select
                      value={activeFilters[filter.id] || "all"}
                      onValueChange={(value) => onFilterChange(filter.id, value === "all" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filter.placeholder || `Selecione ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === "number" && (
                    <Input
                      type="number"
                      placeholder={filter.placeholder || `Filtrar por ${filter.label.toLowerCase()}`}
                      value={activeFilters[filter.id] || ""}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges de Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            if (!value || value === "") return null
            const filter = filters.find(f => f.id === filterId)
            if (!filter) return null
            
            const displayValue = filter.type === "select" && filter.options
              ? filter.options.find(o => o.value === value)?.label || value
              : value

            return (
              <Badge key={filterId} variant="secondary" className="gap-1">
                <span className="text-xs">{filter.label}: {displayValue}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFilterChange(filterId, "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

