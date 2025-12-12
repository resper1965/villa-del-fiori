// Edge Function: Validate Entities
// Descrição: Valida se entidades mencionadas em processos existem e estão completas
// Uso: Validação de entidades antes de salvar processo ou validação em lote

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ValidateRequest {
  entity_names?: string[]
  process_id?: string
  batch?: boolean
}

interface ValidationResult {
  entity_name: string
  exists: boolean
  is_complete: boolean
  missing_fields: string[]
  entity_id?: string
  process_id?: string
  process_name?: string
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { entity_names, process_id, batch }: ValidateRequest = await req.json()

    let results: ValidationResult[] = []

    if (batch) {
      // Validação em lote de todos os processos
      const { data, error } = await supabase.rpc('validate_all_processes_entities')

      if (error) {
        throw new Error(`Erro na validação em lote: ${error.message}`)
      }

      results = (data || []).map((item: any) => ({
        entity_name: item.entity_name,
        exists: item.entity_exists,
        is_complete: item.is_complete,
        missing_fields: item.missing_fields || [],
        entity_id: item.entity_id,
        process_id: item.process_id,
        process_name: item.process_name,
      }))
    } else if (process_id) {
      // Validação de um processo específico
      const { data, error } = await supabase.rpc('validate_process_entities_by_id', {
        p_process_id: process_id,
      })

      if (error) {
        throw new Error(`Erro na validação do processo: ${error.message}`)
      }

      results = (data || []).map((item: any) => ({
        entity_name: item.entity_name,
        exists: item.entity_exists,
        is_complete: item.is_complete,
        missing_fields: item.missing_fields || [],
        entity_id: item.entity_id,
        process_id: item.process_id,
        process_name: item.process_name,
      }))
    } else if (entity_names && entity_names.length > 0) {
      // Validação de lista de entidades
      const { data, error } = await supabase.rpc('validate_process_entities', {
        entity_names: entity_names,
      })

      if (error) {
        throw new Error(`Erro na validação de entidades: ${error.message}`)
      }

      results = (data || []).map((item: any) => ({
        entity_name: item.entity_name,
        exists: item.entity_exists,
        is_complete: item.is_complete,
        missing_fields: item.missing_fields || [],
        entity_id: item.entity_id,
      }))
    } else {
      return new Response(
        JSON.stringify({ error: 'Forneça entity_names, process_id ou batch=true' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Calcular estatísticas
    const stats = {
      total: results.length,
      valid: results.filter((r) => r.exists && r.is_complete).length,
      missing: results.filter((r) => !r.exists).length,
      incomplete: results.filter((r) => r.exists && !r.is_complete).length,
    }

    const isValid = stats.missing === 0 && stats.incomplete === 0

    return new Response(
      JSON.stringify({
        success: true,
        valid: isValid,
        results,
        stats,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error: any) {
    console.error('Erro na função validate-entities:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao validar entidades',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

