// Edge Function: Integrity Metrics
// Descrição: Retorna métricas de integridade de entidades e processos
// Uso: Dashboard de integridade

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar métricas
    const { data: metrics, error } = await supabase.rpc('get_entity_integrity_metrics')

    if (error) {
      throw new Error(`Erro ao buscar métricas: ${error.message}`)
    }

    const result = metrics && metrics.length > 0 ? metrics[0] : {
      total_entities: 0,
      complete_entities: 0,
      incomplete_entities: 0,
      total_processes: 0,
      processes_with_valid_entities: 0,
      processes_with_invalid_entities: 0,
      orphaned_entities: 0,
    }

    return new Response(
      JSON.stringify({
        success: true,
        metrics: result,
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
    console.error('Erro na função integrity-metrics:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao buscar métricas',
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

