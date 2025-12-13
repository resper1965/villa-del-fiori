import { supabase } from "@/lib/supabase/client"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obyrjbhomqtepebykavb.supabase.co'

export type NotificationType =
  | 'approval_pending'
  | 'approved'
  | 'rejected'
  | 'reminder'
  | 'process_refactored'
  | 'process_created'
  | 'process_updated'
  | 'user_approved'
  | 'user_rejected'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  read_at: string | null
  process_id: string | null
  stakeholder_id: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface NotificationsResponse {
  success: boolean
  notifications: Notification[]
  count: number
  unread_count: number
}

export interface UnreadCountResponse {
  success: boolean
  count: number
}

export const notificationsApi = {
  // Listar notificações
  async list(params?: {
    limit?: number
    offset?: number
    unread_only?: boolean
  }): Promise<NotificationsResponse> {
    // Construir URL com query params
    const url = new URL(`${SUPABASE_URL}/functions/v1/notifications`)
    if (params?.limit) url.searchParams.set('limit', params.limit.toString())
    if (params?.offset) url.searchParams.set('offset', params.offset.toString())
    if (params?.unread_only) url.searchParams.set('unread_only', 'true')

    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar notificações: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result || !result.success) {
      throw new Error(result?.error || "Erro desconhecido ao buscar notificações")
    }

    return result
  },

  // Obter contador de não lidas
  async getUnreadCount(): Promise<number> {
    const { data, error } = await supabase.functions.invoke("notifications/unread-count", {
      method: "GET",
    })

    if (error) {
      throw new Error(`Erro ao buscar contador: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Erro desconhecido ao buscar contador")
    }

    return data.count || 0
  },

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke(
      `notifications/${notificationId}/read`,
      {
        method: "PUT",
      }
    )

    if (error) {
      throw new Error(`Erro ao marcar notificação como lida: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Erro desconhecido ao marcar notificação")
    }

    return data.marked || false
  },

  // Marcar todas como lidas
  async markAllAsRead(): Promise<number> {
    const { data, error } = await supabase.functions.invoke("notifications/read-all", {
      method: "PUT",
    })

    if (error) {
      throw new Error(`Erro ao marcar todas como lidas: ${error.message}`)
    }

    if (!data || !data.success) {
      throw new Error(data?.error || "Erro desconhecido ao marcar todas como lidas")
    }

    return data.marked_count || 0
  },
}

