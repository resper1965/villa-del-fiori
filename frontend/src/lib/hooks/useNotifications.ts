import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsApi, Notification } from "@/lib/api/notifications"

// Hook para listar notificações
export const useNotifications = (params?: {
  limit?: number
  offset?: number
  unread_only?: boolean
}) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsApi.list(params),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada minuto
  })
}

// Hook para contador de não lidas
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
  })
}

// Hook para marcar como lida
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidar queries de notificações
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

// Hook para marcar todas como lidas
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      // Invalidar queries de notificações
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

