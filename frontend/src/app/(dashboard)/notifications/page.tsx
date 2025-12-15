"use client"

import { useState, useMemo } from "react"
import { Bell, CheckCheck, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/lib/hooks/useNotifications"
import { Notification } from "@/lib/api/notifications"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApproveProcess, useRejectProcess } from "@/lib/hooks/useApprovals"
import { ApprovalDialog } from "@/components/approvals/ApprovalDialog"
import { RejectionDialog } from "@/components/approvals/RejectionDialog"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"

const notificationTypeLabels: Record<string, string> = {
  approval_pending: "Aprovação Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  reminder: "Lembrete",
  process_refactored: "Processo Atualizado",
  process_created: "Processo Criado",
  process_updated: "Processo Atualizado",
  user_approved: "Usuário Aprovado",
  user_rejected: "Usuário Rejeitado",
}

const notificationTypeColors: Record<string, string> = {
  approval_pending: "bg-warning/20 text-warning border-warning/30",
  approved: "bg-success/20 text-success border-success/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
  reminder: "bg-info/20 text-info border-info/30",
  process_refactored: "bg-purple-500/20 text-purple border-purple/30",
  process_created: "bg-info/20 text-info border-info/30",
  process_updated: "bg-purple-500/20 text-purple border-purple/30",
  user_approved: "bg-success/20 text-success border-success/30",
  user_rejected: "bg-destructive/20 text-destructive border-destructive/30",
}

function formatRelativeTime(date: string): string {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "agora"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `há ${minutes} minuto${minutes > 1 ? "s" : ""}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `há ${hours} hora${hours > 1 ? "s" : ""}`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `há ${days} dia${days > 1 ? "s" : ""}`
  } else {
    return notificationDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
}

const DEFAULT_ITEMS_PER_PAGE = 20
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100]

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  
  const offset = (currentPage - 1) * itemsPerPage
  
  const { data, isLoading, refetch } = useNotifications({
    limit: itemsPerPage,
    offset: offset,
    unread_only: filter === "unread",
  })
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const approveMutation = useApproveProcess()
  const rejectMutation = useRejectProcess()

  const allNotifications = data?.notifications || []
  const totalCount = data?.count || 0
  const unreadCount = data?.unread_count || 0
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Filtrar notificações por tipo (após paginação)
  const notifications = useMemo(() => {
    if (typeFilter === "all") {
      return allNotifications
    }
    return allNotifications.filter((n) => n.type === typeFilter)
  }, [allNotifications, typeFilter])

  // Resetar página quando filtros mudarem
  const handleFilterChange = (newFilter: "all" | "unread") => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const handleTypeFilterChange = (newType: string) => {
    setTypeFilter(newType)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (newItemsPerPage: string) => {
    setItemsPerPage(Number(newItemsPerPage))
    setCurrentPage(1) // Resetar para primeira página ao mudar itens por página
  }

  const notificationTypes = useMemo(() => {
    const types = new Set(allNotifications.map((n) => n.type))
    return Array.from(types)
  }, [allNotifications])

  // Buscar dados do processo quando necessário
  const { data: processData } = useQuery({
    queryKey: ["process", selectedNotification?.process_id],
    queryFn: async () => {
      if (!selectedNotification?.process_id) return null
      
      // Buscar processo
      const { data: process, error: processError } = await supabase
        .from("processes")
        .select("*")
        .eq("id", selectedNotification.process_id)
        .single()
      
      if (processError) throw processError
      if (!process) return null
      
      // Buscar versão atual
      const { data: version, error: versionError } = await supabase
        .from("process_versions")
        .select("*")
        .eq("process_id", process.id)
        .eq("version_number", process.current_version_number)
        .single()
      
      if (versionError) throw versionError
      
      return {
        ...process,
        current_version: version,
      }
    },
    enabled: !!selectedNotification?.process_id && (approvalDialogOpen || rejectionDialogOpen),
  })

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id)
    }

    if (notification.process_id) {
      router.push(`/processes/${notification.process_id}`)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync()
    refetch()
  }

  const handleQuickApprove = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNotification(notification)
    setApprovalDialogOpen(true)
  }

  const handleQuickReject = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNotification(notification)
    setRejectionDialogOpen(true)
  }

  const handleApprove = async (comment?: string) => {
    if (!selectedNotification?.process_id || !processData?.current_version?.id) return
    
    try {
      await approveMutation.mutateAsync({
        processId: selectedNotification.process_id,
        versionId: processData.current_version.id,
        data: { comments: comment },
      })
      
      // Marcar notificação como lida
      await markAsRead.mutateAsync(selectedNotification.id)
      
      toast({
        variant: "success",
        title: "Processo aprovado",
        description: "O processo foi aprovado com sucesso.",
      })
      
      setApprovalDialogOpen(false)
      setSelectedNotification(null)
      refetch()
    } catch (error: any) {
      console.error("Erro ao aprovar:", error)
      toast({
        variant: "destructive",
        title: "Erro ao aprovar",
        description: error?.message || "Ocorreu um erro ao aprovar o processo.",
      })
    }
  }

  const handleReject = async (reason: string) => {
    if (!selectedNotification?.process_id || !processData?.current_version?.id) return
    
    try {
      await rejectMutation.mutateAsync({
        processId: selectedNotification.process_id,
        versionId: processData.current_version.id,
        data: { reason },
      })
      
      // Marcar notificação como lida
      await markAsRead.mutateAsync(selectedNotification.id)
      
      toast({
        variant: "success",
        title: "Processo rejeitado",
        description: "O processo foi rejeitado com sucesso.",
      })
      
      setRejectionDialogOpen(false)
      setSelectedNotification(null)
      refetch()
    } catch (error: any) {
      console.error("Erro ao rejeitar:", error)
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar",
        description: error?.message || "Ocorreu um erro ao rejeitar o processo.",
      })
    }
  }

  return (
    <div className="px-4 md:px-6 py-4 md:py-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                : "Todas as notificações foram lidas"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleFilterChange(filter === "all" ? "unread" : "all")}
            >
              {filter === "all" ? "Mostrar não lidas" : "Mostrar todas"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marcando...
                  </>
                ) : (
                  <>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Marcar todas como lidas
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Filtro por tipo */}
        {notificationTypes.length > 0 && (
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {notificationTypeLabels[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {typeFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeFilterChange("all")}
              >
                Limpar filtro
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Bell}
              title={filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
              description={
                filter === "unread"
                  ? "Todas as suas notificações foram lidas. Quando houver novas notificações, elas aparecerão aqui."
                  : "Você ainda não recebeu nenhuma notificação. Quando houver atualizações sobre processos, aprovações ou outras atividades, elas aparecerão aqui."
              }
              action={
                filter === "unread" ? (
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    Ver Todas as Notificações
                  </Button>
                ) : null
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:bg-card/50 ${
                !notification.is_read ? "border-l-4 border-l-primary bg-card/30" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`${notificationTypeColors[notification.type] || ""}`}
                      >
                        {notificationTypeLabels[notification.type] || notification.type}
                      </Badge>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <CardTitle className="text-lg mb-1">{notification.title}</CardTitle>
                    <CardDescription className="text-base">
                      {notification.message}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground ml-4">
                    {formatRelativeTime(notification.created_at)}
                  </div>
                </div>
                {notification.process_id && (
                  <div className="mt-2">
                    <Link
                      href={`/processes/${notification.process_id}`}
                      className="text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver processo →
                    </Link>
                  </div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {!isLoading && notifications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Mostrando {offset + 1} a {Math.min(offset + itemsPerPage, totalCount)} de {totalCount} notificações
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Diálogos de Aprovação/Rejeição */}
      {selectedNotification && processData && (
        <>
          <ApprovalDialog
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            processName={processData.name || "Processo"}
            onApprove={handleApprove}
          />
          <RejectionDialog
            open={rejectionDialogOpen}
            onOpenChange={setRejectionDialogOpen}
            processName={processData.name || "Processo"}
            onReject={handleReject}
          />
        </>
      )}
    </div>
  )
}

