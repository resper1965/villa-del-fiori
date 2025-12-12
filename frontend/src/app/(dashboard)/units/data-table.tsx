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
import { ArrowUpDown, Columns, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Unit } from "@/types"
import { AdvancedFilters, FilterConfig } from "@/components/ui/advanced-filters"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UnitsDataTableProps {
  data: Unit[]
  onEdit?: (unitId: string) => void
  onDelete?: (unitId: string) => void
  onViewDetails?: (unitId: string) => void
  isLoading?: boolean
}

export function createColumns(
  onEdit?: (unitId: string) => void,
  onDelete?: (unitId: string) => void,
  onViewDetails?: (unitId: string) => void
): ColumnDef<Unit>[] {
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
      accessorKey: "number",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Número
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("number")}</div>,
    },
    {
      accessorKey: "block",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Bloco
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const block = row.getValue("block") as string
        return block ? <div className="text-sm">{block}</div> : <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: "floor",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Andar
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const floor = row.getValue("floor") as number
        return floor ? <div className="text-sm">{floor}º</div> : <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: "area",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Área (m²)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const area = row.getValue("area") as number
        return area ? <div className="text-sm">{area.toFixed(2)}</div> : <span className="text-muted-foreground">-</span>
      },
    },
    {
      accessorKey: "parking_spots",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Vagas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const spots = row.getValue("parking_spots") as number
        return spots ? <div className="text-sm">{spots}</div> : <span className="text-muted-foreground">0</span>
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
        const unit = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(unit.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(unit.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(unit.id)}
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

export default function UnitsDataTable({
  data,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading,
}: UnitsDataTableProps) {
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

  // Obter blocos únicos para filtro
  const uniqueBlocks = React.useMemo(() => {
    const blocks = new Set<string>()
    data.forEach(unit => {
      if (unit.block) blocks.add(unit.block)
    })
    return Array.from(blocks).sort()
  }, [data])

  const filterConfigs: FilterConfig[] = [
    {
      id: "block",
      label: "Bloco",
      type: "select",
      options: uniqueBlocks.map(block => ({ value: block, label: block })),
      placeholder: "Todos os blocos",
    },
    {
      id: "floor",
      label: "Andar",
      type: "number",
      placeholder: "Filtrar por andar",
    },
    {
      id: "parking_spots",
      label: "Vagas de Garagem",
      type: "number",
      placeholder: "Mínimo de vagas",
    },
  ]

  const columns = React.useMemo(
    () => createColumns(onEdit, onDelete, onViewDetails),
    [onEdit, onDelete, onViewDetails]
  )

  // Aplicar filtros avançados
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = []
    
    if (advancedFilters.block) {
      newFilters.push({ id: "block", value: advancedFilters.block })
    }
    if (advancedFilters.floor) {
      newFilters.push({ id: "floor", value: advancedFilters.floor })
    }
    if (advancedFilters.parking_spots) {
      newFilters.push({ id: "parking_spots", value: advancedFilters.parking_spots })
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
      const number = (row.getValue("number") as string)?.toLowerCase() || ""
      const block = (row.getValue("block") as string)?.toLowerCase() || ""
      const description = (row.original.description as string)?.toLowerCase() || ""
      
      return number.includes(search) || block.includes(search) || description.includes(search)
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
          globalSearchPlaceholder="Buscar por número, bloco ou descrição..."
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getFilteredRowModel().rows.length} de {data.length} unidade(s)
            {table.getFilteredRowModel().rows.length !== data.length && (
              <span className="ml-1">(filtradas)</span>
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
                      {column.id === "number" && "Número"}
                      {column.id === "block" && "Bloco"}
                      {column.id === "floor" && "Andar"}
                      {column.id === "area" && "Área"}
                      {column.id === "parking_spots" && "Vagas"}
                      {column.id === "created_at" && "Cadastrado em"}
                      {!["number", "block", "floor", "area", "parking_spots", "created_at"].includes(column.id) && column.id}
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
                  Nenhuma unidade encontrada.
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
            {Object.keys(rowSelection).length} unidade(s) selecionada(s)
          </div>
        )}
      </div>
    </div>
  )
}

