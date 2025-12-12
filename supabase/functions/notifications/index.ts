// Edge Function: Notifications
// Descrição: Gerencia notificações de usuários (listar, marcar como lida, etc.)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obter token de autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Criar cliente autenticado
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/notifications', '')

    // GET /notifications - Listar notificações
    if (req.method === 'GET' && (path === '' || path === '/')) {
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      const unreadOnly = url.searchParams.get('unread_only') === 'true'

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Erro ao buscar notificações: ${error.message}`)
      }

      // Buscar contador de não lidas
      const { data: unreadCount } = await supabase.rpc('get_unread_notifications_count', {
        p_user_id: user.id,
      })

      return new Response(
        JSON.stringify({
          success: true,
          notifications: data || [],
          count: count || 0,
          unread_count: unreadCount || 0,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // GET /notifications/unread-count - Contador de não lidas
    if (req.method === 'GET' && path === '/unread-count') {
      const { data: count, error } = await supabase.rpc('get_unread_notifications_count', {
        p_user_id: user.id,
      })

      if (error) {
        throw new Error(`Erro ao buscar contador: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          count: count || 0,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // PUT /notifications/:id/read - Marcar como lida
    if (req.method === 'PUT' && path.includes('/') && path.endsWith('/read')) {
      const notificationId = path.split('/')[1]?.replace('/read', '')

      if (!notificationId) {
        return new Response(
          JSON.stringify({ error: 'Notification ID required' }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
        )
      }

      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_user_id: user.id,
      })

      if (error) {
        throw new Error(`Erro ao marcar notificação como lida: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          marked: data,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // PUT /notifications/read-all - Marcar todas como lidas
    if (req.method === 'PUT' && path === '/read-all') {
      const { data: count, error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: user.id,
      })

      if (error) {
        throw new Error(`Erro ao marcar todas como lidas: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          marked_count: count || 0,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error: any) {
    console.error('Erro na função notifications:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar notificações',
        details: error.toString(),
      }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
    )
  }
})

