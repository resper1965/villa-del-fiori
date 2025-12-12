"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUnreadNotificationsCount, useNotifications, useMarkNotificationAsRead } from "@/lib/hooks/useNotifications"
import { Notification } from "@/lib/api/notifications"
// Função auxiliar para formatar data relativa
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
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
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
  approval_pending: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  reminder: "bg-blue-500/20 text-blue-500",
  process_refactored: "bg-purple-500/20 text-purple-500",
  process_created: "bg-blue-500/20 text-blue-500",
  process_updated: "bg-purple-500/20 text-purple-500",
  user_approved: "bg-green-500/20 text-green-500",
  user_rejected: "bg-red-500/20 text-red-500",
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: unreadCount = 0, isLoading: isLoadingCount } = useUnreadNotificationsCount()
  const { data, isLoading } = useNotifications({ limit: 10, unread_only: false })
  const markAsRead = useMarkNotificationAsRead()

  const notifications = data?.notifications || []

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id)
    }

    if (notification.process_id) {
      router.push(`/processes/${notification.process_id}`)
    }

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} não lidas</Badge>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 hover:bg-slate-800 transition-colors ${
                    !notification.is_read ? "bg-slate-800/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${notificationTypeColors[notification.type] || ""}`}
                        >
                          {notificationTypeLabels[notification.type] || notification.type}
                        </Badge>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-[#00ade8]" />
                        )}
                      </div>
                      <p className="font-medium text-sm mb-1">{notification.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Link
              href="/notifications"
              className="block w-full text-center text-sm text-[#00ade8] hover:underline py-2"
              onClick={() => setOpen(false)}
            >
              Ver todas as notificações
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

