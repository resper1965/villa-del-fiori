"use client"

import { useState } from "react"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/lib/hooks/useNotifications"
import { Notification } from "@/lib/api/notifications"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  approval_pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-500 border-green-500/30",
  rejected: "bg-red-500/20 text-red-500 border-red-500/30",
  reminder: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  process_refactored: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  process_created: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  process_updated: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  user_approved: "bg-green-500/20 text-green-500 border-green-500/30",
  user_rejected: "bg-red-500/20 text-red-500 border-red-500/30",
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

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const { data, isLoading, refetch } = useNotifications({
    limit: 100,
    unread_only: filter === "unread",
  })
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const notifications = data?.notifications || []
  const unreadCount = data?.unread_count || 0

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

  return (
    <div className="px-4 md:px-6 py-4 md:py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
              : "Todas as notificações foram lidas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
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

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Nenhuma notificação</CardTitle>
            <CardDescription>
              {filter === "unread"
                ? "Você não tem notificações não lidas"
                : "Você não tem notificações"}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:bg-slate-800/50 ${
                !notification.is_read ? "border-l-4 border-l-[#00ade8] bg-slate-800/30" : ""
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
                        <div className="h-2 w-2 rounded-full bg-[#00ade8]" />
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
                      className="text-sm text-[#00ade8] hover:underline"
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
    </div>
  )
}

