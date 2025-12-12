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
import { Checkbox } from "@/components/ui/checkbox"
import { Supplier } from "@/types"
import { AdvancedFilters, FilterConfig } from "@/components/ui/advanced-filters"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const supplierTypeLabels: Record<string, string> = {
  administradora: "Administradora",
  portaria_virtual: "Portaria Virtual",
  elevador: "Elevador",
  gerador: "Gerador",
  limpeza: "Limpeza",
  seguranca: "Segurança",
  outro: "Outro",
}

interface SuppliersDataTableProps {
  data: Supplier[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export function createColumns(
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void
): ColumnDef<Supplier>[] {
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "supplier_type",
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
        const type = row.getValue("supplier_type") as string
        return (
          <Badge variant="outline">
            {supplierTypeLabels[type] || type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "condominium",
      header: "Condomínio",
      cell: ({ row }) => {
        const condo = row.original.condominium
        return <div className="text-sm">{condo?.name || "-"}</div>
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-sm">{row.getValue("email") || "-"}</div>,
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => <div className="text-sm">{row.getValue("phone") || "-"}</div>,
    },
    {
      accessorKey: "monthly_value",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Valor Mensal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue("monthly_value") as number | null
        return (
          <div className="text-sm">
            {value ? `R$ ${value.toFixed(2)}` : "-"}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const supplier = row.original

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
                <DropdownMenuItem onClick={() => onEdit(supplier.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(supplier.id)}
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

export default function SuppliersDataTable({
  data,
  onEdit,
  onDelete,
  isLoading,
}: SuppliersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  const columns = React.useMemo(
    () => createColumns(onEdit, onDelete),
    [onEdit, onDelete]
  )

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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      const name = row.original.name?.toLowerCase() || ""
      const email = row.original.email?.toLowerCase() || ""
      const phone = row.original.phone?.toLowerCase() || ""
      const type = supplierTypeLabels[row.original.supplier_type]?.toLowerCase() || ""
      const condo = row.original.condominium?.name?.toLowerCase() || ""
      return name.includes(search) || email.includes(search) || phone.includes(search) || type.includes(search) || condo.includes(search)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const [advancedFilters, setAdvancedFilters] = React.useState<Record<string, string>>({})

  const filterConfigs: FilterConfig[] = [
    {
      id: "supplier_type",
      label: "Tipo",
      type: "select",
      options: Object.entries(supplierTypeLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      id: "category",
      label: "Categoria",
      type: "select",
      options: [
        { value: "servico", label: "Serviço" },
        { value: "manutencao", label: "Manutenção" },
        { value: "administracao", label: "Administração" },
      ],
    },
  ]

  // Aplicar filtros avançados
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = []
    
    if (advancedFilters.supplier_type) {
      newFilters.push({ id: "supplier_type", value: advancedFilters.supplier_type })
    }
    if (advancedFilters.category) {
      newFilters.push({ id: "category", value: advancedFilters.category })
    }
    
    setColumnFilters(newFilters)
  }, [advancedFilters])

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
    <div className="w-full space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4 py-4">
        <AdvancedFilters
          filters={filterConfigs}
          activeFilters={advancedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          globalSearch={globalFilter}
          onGlobalSearchChange={setGlobalFilter}
          globalSearchPlaceholder="Buscar por nome, tipo, email, telefone ou condomínio..."
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {table.getFilteredRowModel().rows.length} de {data.length} fornecedor(es)
            {table.getFilteredRowModel().rows.length !== data.length && (
              <span className="ml-1">(filtrados)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
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
                      {column.id === "name" && "Nome"}
                      {column.id === "supplier_type" && "Tipo"}
                      {column.id === "condominium" && "Condomínio"}
                      {column.id === "email" && "Email"}
                      {column.id === "phone" && "Telefone"}
                      {column.id === "monthly_value" && "Valor Mensal"}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border border-gray-700/50">
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
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-400">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400">Linhas por página</p>
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
            <p className="text-sm text-gray-400">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </p>
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
        </div>
      </div>
    </div>
  )
}

