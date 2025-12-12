// Edge Function: Update User Metadata
// Descrição: Atualiza app_metadata do usuário no Supabase Auth e sincroniza com stakeholders
// Uso: Atualizar roles, aprovação e outros metadados de usuários

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com service role (admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obter token do usuário que está fazendo a requisição
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o usuário tem permissão (admin, syndic ou subsindico)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: currentUser }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar role do usuário atual
    const userRole = currentUser.app_metadata?.user_role
    const isSuperadmin = currentUser.id === Deno.env.get('SUPERADMIN_UID')
    
    if (!isSuperadmin && !['admin', 'syndic', 'subsindico'].includes(userRole)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only admin, syndic or subsindico can update user metadata' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { userId, appMetadata } = await req.json()

    if (!userId || !appMetadata) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, appMetadata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar usuário atual para preservar metadados existentes
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (fetchError || !existingUser.user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mesclar app_metadata existente com novos valores
    const currentMetadata = existingUser.user.app_metadata || {}
    const updatedMetadata = {
      ...currentMetadata,
      ...appMetadata,
    }

    // Se is_approved mudou para true, adicionar approved_at e approved_by
    if (appMetadata.is_approved === true && !currentMetadata.is_approved) {
      updatedMetadata.approved_at = new Date().toISOString()
      updatedMetadata.approved_by = currentUser.id
    }

    // Atualizar app_metadata no Supabase Auth
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        app_metadata: updatedMetadata,
      }
    )

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sincronizar com tabela stakeholders
    const updateData: any = {}
    
    if (appMetadata.user_role !== undefined) {
      updateData.user_role = appMetadata.user_role
    }
    
    if (appMetadata.is_approved !== undefined) {
      updateData.is_approved = appMetadata.is_approved
      if (appMetadata.is_approved) {
        updateData.approved_at = updatedMetadata.approved_at
        updateData.approved_by = updatedMetadata.approved_by
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error: stakeholderError } = await supabaseAdmin
        .from('stakeholders')
        .update(updateData)
        .eq('auth_user_id', userId)

      if (stakeholderError) {
        // Logar erro mas não falhar (app_metadata é fonte da verdade)
        console.error('Error updating stakeholder:', stakeholderError)
      }
    }

    return new Response(
      JSON.stringify({ 
        user: updatedUser.user,
        message: 'User metadata updated successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-user-metadata function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

