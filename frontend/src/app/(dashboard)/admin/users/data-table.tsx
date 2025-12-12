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
import { ArrowUpDown, Columns, MoreHorizontal, UserCheck, UserX, Edit, Trash2 } from "lucide-react"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { generateAvatarFallback } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { AdvancedFilters, FilterConfig } from "@/components/ui/advanced-filters"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Stakeholder = {
  id: string
  auth_user_id?: string // ID do usuário no Supabase Auth
  name: string
  email: string
  type: string
  user_role: "admin" | "syndic" | "subsindico" | "council" | "staff" | "resident"
  unit_id?: string | null
  unit?: {
    id: string
    number: string
    block?: string
    floor?: number
  } | null
  relationship_type?: "proprietario" | "morador" | "proprietario_morador" | null
  is_owner?: boolean
  is_resident?: boolean
  owner_id?: string | null
  owner?: Stakeholder | null
  phone?: string | null
  phone_secondary?: string | null
  whatsapp?: string | null
  has_whatsapp?: boolean
  is_approved: boolean
  is_active: boolean
  created_at: string
  approved_at?: string | null
  approved_by?: string | null
}

interface UsersDataTableProps {
  data: Stakeholder[]
  onApprove?: (userId: string) => void
  onReject?: (userId: string) => void
  onEdit?: (userId: string, userEmail: string) => void
  onDelete?: (userId: string) => void
  isLoading?: boolean
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  syndic: "Síndico",
  subsindico: "Subsíndico",
  council: "Conselheiro",
  staff: "Staff",
  resident: "Morador",
}

export function createColumns(
  onApprove?: (userId: string) => void,
  onReject?: (userId: string) => void,
  onEdit?: (userId: string, userEmail: string) => void,
  onDelete?: (userId: string) => void
): ColumnDef<Stakeholder>[] {
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
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{generateAvatarFallback(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{row.getValue("name")}</div>
        </div>
      ),
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
      cell: ({ row }) => <div className="text-sm">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Telefone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string | null | undefined
        const whatsapp = row.original.whatsapp
        const hasWhatsapp = row.original.has_whatsapp
        
        if (!phone && !whatsapp) {
          return <span className="text-muted-foreground text-sm">-</span>
        }
        
        return (
          <div className="text-sm space-y-1">
            {phone && (
              <div className="flex items-center gap-1">
                <span>{phone}</span>
                {hasWhatsapp && whatsapp === phone && (
                  <span className="text-success text-xs" title="Tem WhatsApp">💬</span>
                )}
              </div>
            )}
            {whatsapp && whatsapp !== phone && (
              <div className="text-xs text-muted-foreground">
                WA: {whatsapp}
              </div>
            )}
          </div>
        )
      },
      enableHiding: true,
    },
    {
      accessorKey: "user_role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Função
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const role = row.getValue("user_role") as string
        return (
          <Badge variant="secondary">{roleLabels[role] || role}</Badge>
        )
      },
    },
    {
      accessorKey: "type",
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
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("type")}</Badge>
      ),
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
            {unit.floor && (
              <div className="text-xs text-muted-foreground">{unit.floor}º andar</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "relationship_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Vínculo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const relationshipType = row.getValue("relationship_type") as string | null | undefined
        const isOwner = row.original.is_owner
        const isResident = row.original.is_resident
        
        if (!relationshipType) {
          // Fallback para dados antigos
          if (isOwner && isResident) {
            return <Badge variant="outline" className="bg-info/10 text-info border-info/20">Proprietário/Morador</Badge>
          } else if (isOwner) {
            return <Badge variant="outline" className="bg-purple/10 text-purple border-purple/20">Proprietário</Badge>
          } else if (isResident) {
            return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Morador</Badge>
          }
          return <span className="text-muted-foreground text-sm">-</span>
        }
        
        const labels: Record<string, { label: string; className: string }> = {
          proprietario_morador: { label: "Proprietário/Morador", className: "bg-info/10 text-info border-info/20" },
          proprietario: { label: "Proprietário", className: "bg-purple/10 text-purple border-purple/20" },
          morador: { label: "Locatário", className: "bg-success/10 text-success border-success/20" },
        }
        
        const config = labels[relationshipType]
        if (!config) return <span className="text-muted-foreground text-sm">-</span>
        
        return <Badge variant="outline" className={config.className}>{config.label}</Badge>
      },
    },
    {
      accessorKey: "is_approved",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isApproved = row.getValue("is_approved") as boolean
        const isActive = row.original.is_active

        if (!isActive) {
          return (
            <Badge variant="destructive" className="capitalize">
              Rejeitado
            </Badge>
          )
        }

        if (isApproved) {
          return (
            <Badge className="bg-success/10 text-success border-success/20">
              Aprovado
            </Badge>
          )
        }

        return (
          <Badge variant="outline" className="text-warning border-yellow-500/50">
            Pendente
          </Badge>
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
        const stakeholder = row.original
        const canApprove = !stakeholder.is_approved && stakeholder.is_active
        const canReject = stakeholder.is_active

        if (!canApprove && !canReject) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(stakeholder.auth_user_id || stakeholder.id, stakeholder.email)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canApprove && onApprove && (
                <DropdownMenuItem
                  onClick={() => onApprove(stakeholder.auth_user_id || stakeholder.id)}
                  className="text-success"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Aprovar
                </DropdownMenuItem>
              )}
              {canReject && onReject && (
                <DropdownMenuItem
                  onClick={() => onReject(stakeholder.auth_user_id || stakeholder.id)}
                  className="text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Rejeitar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(stakeholder.auth_user_id || stakeholder.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export default function UsersDataTable({
  data,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  isLoading = false,
}: UsersDataTableProps) {
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
  const uniqueRoles = React.useMemo(() => {
    const roles = new Set<string>()
    data.forEach(user => {
      if (user.user_role) roles.add(user.user_role)
    })
    return Array.from(roles).sort()
  }, [data])

  const uniqueTypes = React.useMemo(() => {
    const types = new Set<string>()
    data.forEach(user => {
      if (user.type) types.add(user.type)
    })
    return Array.from(types).sort()
  }, [data])

  const filterConfigs: FilterConfig[] = [
    {
      id: "user_role",
      label: "Função",
      type: "select",
      options: uniqueRoles.map(role => ({ 
        value: role, 
        label: roleLabels[role] || role 
      })),
      placeholder: "Todas as funções",
    },
    {
      id: "type",
      label: "Tipo",
      type: "select",
      options: uniqueTypes.map(type => ({ value: type, label: type })),
      placeholder: "Todos os tipos",
    },
    {
      id: "is_approved",
      label: "Status",
      type: "select",
      options: [
        { value: "true", label: "Aprovado" },
        { value: "false", label: "Pendente" },
      ],
      placeholder: "Todos os status",
    },
  ]

  const columns = React.useMemo(
    () => createColumns(onApprove, onReject, onEdit, onDelete),
    [onApprove, onReject, onEdit, onDelete]
  )

  // Aplicar filtros avançados
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = []
    
    if (advancedFilters.user_role) {
      newFilters.push({ id: "user_role", value: advancedFilters.user_role })
    }
    if (advancedFilters.type) {
      newFilters.push({ id: "type", value: advancedFilters.type })
    }
    if (advancedFilters.is_approved) {
      newFilters.push({ id: "is_approved", value: advancedFilters.is_approved === "true" })
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
      const name = (row.getValue("name") as string)?.toLowerCase() || ""
      const email = (row.getValue("email") as string)?.toLowerCase() || ""
      const unit = row.original.unit?.number?.toLowerCase() || ""
      
      return name.includes(search) || email.includes(search) || unit.includes(search)
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
          globalSearchPlaceholder="Buscar por nome, email ou unidade..."
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getFilteredRowModel().rows.length} de {data.length} usuário(s)
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
                      {column.id === "name" && "Nome"}
                      {column.id === "email" && "Email"}
                      {column.id === "phone" && "Telefone"}
                      {column.id === "user_role" && "Função"}
                      {column.id === "type" && "Tipo"}
                      {column.id === "unit" && "Unidade"}
                      {column.id === "relationship_type" && "Vínculo"}
                      {column.id === "is_approved" && "Status"}
                      {column.id === "created_at" && "Cadastrado em"}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
            {Object.keys(rowSelection).length} usuário(s) selecionado(s)
          </div>
        )}
      </div>
    </div>
  )
}

