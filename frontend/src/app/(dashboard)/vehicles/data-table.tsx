"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Columns, MoreHorizontal, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Vehicle } from "@/types"
import { AdvancedFilters, FilterConfig } from "@/components/ui/advanced-filters"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VehiclesDataTableProps {
  data: Vehicle[]
  onEdit?: (vehicleId: string) => void
  onDelete?: (vehicleId: string) => void
  isLoading?: boolean
}

const vehicleTypeLabels: Record<string, string> = {
  carro: "Carro",
  moto: "Moto",
  caminhao: "Caminhão",
  van: "Van",
  outro: "Outro",
}

export function createColumns(
  onEdit?: (vehicleId: string) => void,
  onDelete?: (vehicleId: string) => void
): ColumnDef<Vehicle>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "license_plate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Placa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const plate = row.getValue("license_plate") as string
        // Formatar placa: ABC1234 ou ABC1D23
        const formatted = plate.length === 7 
          ? `${plate.slice(0, 3)}-${plate.slice(3)}`
          : `${plate.slice(0, 3)}${plate.slice(3, 4)}-${plate.slice(4)}`
        return <div className="font-mono font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "brand",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Marca
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("brand")}</div>,
    },
    {
      accessorKey: "model",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Modelo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("model")}</div>,
    },
    {
      accessorKey: "color",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Cor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const color = row.getValue("color") as string
        return color ? <div className="text-sm text-muted-foreground">{color}</div> : <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: "year",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Ano
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const year = row.getValue("year") as number
        return year ? <div className="text-sm">{year}</div> : <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: "vehicle_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Tipo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const type = row.getValue("vehicle_type") as string
        return (
          <Badge variant="outline">{vehicleTypeLabels[type] || type}</Badge>
        )
      },
    },
    {
      accessorKey: "unit",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Unidade
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const unit = row.original.unit
        if (!unit) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        return (
          <div className="text-sm">
            <div className="font-medium">{unit.number}</div>
            {unit.block && (
              <div className="text-xs text-muted-foreground">Bloco {unit.block}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Cadastrado em
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <div className="text-sm">{date.toLocaleDateString("pt-BR")}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const vehicle = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(vehicle.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(vehicle.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export default function VehiclesDataTable({
  data,
  onEdit,
  onDelete,
  isLoading,
}: VehiclesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [advancedFilters, setAdvancedFilters] = React.useState<Record<string, string>>({})

  // Obter valores únicos para filtros
  const uniqueBrands = React.useMemo(() => {
    const brands = new Set<string>()
    data.forEach(vehicle => {
      if (vehicle.brand) brands.add(vehicle.brand)
    })
    return Array.from(brands).sort()
  }, [data])

  const uniqueTypes = React.useMemo(() => {
    const types = new Set<string>()
    data.forEach(vehicle => {
      if (vehicle.vehicle_type) types.add(vehicle.vehicle_type)
    })
    return Array.from(types).sort()
  }, [data])

  const filterConfigs: FilterConfig[] = [
    {
      id: "brand",
      label: "Marca",
      type: "select",
      options: uniqueBrands.map(brand => ({ value: brand, label: brand })),
      placeholder: "Todas as marcas",
    },
    {
      id: "vehicle_type",
      label: "Tipo",
      type: "select",
      options: uniqueTypes.map(type => ({ 
        value: type, 
        label: vehicleTypeLabels[type] || type 
      })),
      placeholder: "Todos os tipos",
    },
    {
      id: "year",
      label: "Ano",
      type: "number",
      placeholder: "Ano mínimo",
    },
  ]

  const columns = React.useMemo(
    () => createColumns(onEdit, onDelete),
    [onEdit, onDelete]
  )

  // Aplicar filtros avançados
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = []
    
    if (advancedFilters.brand) {
      newFilters.push({ id: "brand", value: advancedFilters.brand })
    }
    if (advancedFilters.vehicle_type) {
      newFilters.push({ id: "vehicle_type", value: advancedFilters.vehicle_type })
    }
    if (advancedFilters.year) {
      newFilters.push({ id: "year", value: advancedFilters.year })
    }
    
    setColumnFilters(newFilters)
  }, [advancedFilters])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      const search = filterValue.toLowerCase()
      const plate = (row.getValue("license_plate") as string)?.toLowerCase() || ""
      const brand = (row.getValue("brand") as string)?.toLowerCase() || ""
      const model = (row.getValue("model") as string)?.toLowerCase() || ""
      const color = (row.getValue("color") as string)?.toLowerCase() || ""
      const unit = row.original.unit?.number?.toLowerCase() || ""
      
      return plate.includes(search) || 
             brand.includes(search) || 
             model.includes(search) || 
             color.includes(search) ||
             unit.includes(search)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const handleFilterChange = (filterId: string, value: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterId]: value,
    }))
  }

  const handleClearFilters = () => {
    setAdvancedFilters({})
    setGlobalFilter("")
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 py-4">
        <AdvancedFilters
          filters={filterConfigs}
          activeFilters={advancedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          globalSearch={globalFilter}
          onGlobalSearchChange={setGlobalFilter}
          globalSearchPlaceholder="Buscar por placa, marca, modelo, cor ou unidade..."
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getFilteredRowModel().rows.length} de {data.length} veículo(s)
            {table.getFilteredRowModel().rows.length !== data.length && (
              <span className="ml-1">(filtrados)</span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns className="mr-2 h-4 w-4" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "license_plate" && "Placa"}
                      {column.id === "brand" && "Marca"}
                      {column.id === "model" && "Modelo"}
                      {column.id === "color" && "Cor"}
                      {column.id === "year" && "Ano"}
                      {column.id === "vehicle_type" && "Tipo"}
                      {column.id === "unit" && "Unidade"}
                      {column.id === "created_at" && "Cadastrado em"}
                      {!["license_plate", "brand", "model", "color", "year", "vehicle_type", "unit", "created_at"].includes(column.id) && column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum veículo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Linhas por página:</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para primeira página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para próxima página</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {Object.keys(rowSelection).length > 0 && (
          <div className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} veículo(s) selecionado(s)
          </div>
        )}
      </div>
    </div>
  )
}

