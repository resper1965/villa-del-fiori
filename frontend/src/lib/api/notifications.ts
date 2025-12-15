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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return 0
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) {
      throw new Error(`Erro ao buscar contador: ${error.message}`)
    }

    return count || 0
  },

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id)

    if (error) {
      throw new Error(`Erro ao marcar notificação como lida: ${error.message}`)
    }

    return true
  },

  // Marcar todas como lidas
  async markAllAsRead(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    const { count, error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .select("*", { count: "exact", head: false })

    if (error) {
      throw new Error(`Erro ao marcar todas como lidas: ${error.message}`)
    }

    return count || 0
  },
}

