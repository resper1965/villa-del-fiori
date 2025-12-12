// Edge Function: Create User
// Descrição: Cria usuário no Supabase Auth e registra na tabela stakeholders
// Uso: Chamado pelo admin para criar novos usuários

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
        JSON.stringify({ error: 'Forbidden: Only admin, syndic or subsindico can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { 
      email, 
      password, 
      name, 
      type, 
      user_role, 
      unit_id, 
      relationship_type,
      is_owner,
      is_resident,
      owner_id,
      phone,
      phone_secondary,
      whatsapp,
      has_whatsapp,
      address_street,
      address_number,
      address_complement,
      address_neighborhood,
      address_city,
      address_state,
      address_zipcode,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      is_approved 
    } = await req.json()

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        name,
        type: type || 'morador',
      },
      app_metadata: {
        user_role: user_role || 'resident',
        is_approved: is_approved || false,
        approved_at: is_approved ? new Date().toISOString() : null,
        approved_by: is_approved ? currentUser.id : null,
      },
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar registro na tabela stakeholders
    const { error: stakeholderError } = await supabaseAdmin
      .from('stakeholders')
      .insert({
        auth_user_id: authData.user.id,
        name,
        email,
        type: type || 'morador',
        user_role: user_role || 'resident',
        unit_id: unit_id || null,
        relationship_type: relationship_type || null,
        is_owner: is_owner ?? false,
        is_resident: is_resident ?? true,
        owner_id: owner_id || null,
        phone: phone || null,
        phone_secondary: phone_secondary || null,
        whatsapp: whatsapp || null,
        has_whatsapp: has_whatsapp || false,
        address_street: address_street || null,
        address_number: address_number || null,
        address_complement: address_complement || null,
        address_neighborhood: address_neighborhood || null,
        address_city: address_city || null,
        address_state: address_state || null,
        address_zipcode: address_zipcode || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        emergency_contact_relationship: emergency_contact_relationship || null,
        is_employee: false,
        employee_role: null,
        employee_unit_id: null,
        condominium_role: null,
        is_approved: is_approved || false,
        approved_at: is_approved ? new Date().toISOString() : null,
        approved_by: is_approved ? currentUser.id : null,
        is_active: true,
      })

    if (stakeholderError) {
      // Se falhar ao criar stakeholder, logar mas não falhar (app_metadata é fonte da verdade)
      console.error('Error creating stakeholder:', stakeholderError)
    }

    return new Response(
      JSON.stringify({ 
        user: authData.user,
        message: 'User created successfully' 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

