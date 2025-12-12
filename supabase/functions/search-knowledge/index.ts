// Edge Function: Search Knowledge
// Descrição: Busca semântica na base de conhecimento usando embeddings
// Uso: Recebe query text, gera embedding e busca documentos similares

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings'
const EMBEDDING_MODEL = Deno.env.get('EMBEDDING_MODEL') || 'text-embedding-3-small'
const EMBEDDING_DIMENSION = 1536

interface SearchRequest {
  query: string
  match_threshold?: number
  match_count?: number
  filter_metadata?: Record<string, any>
  use_hybrid?: boolean
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Verificar API key
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada')
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { 
      query, 
      match_threshold = 0.7, 
      match_count = 10,
      filter_metadata = {},
      use_hybrid = false
    }: SearchRequest = await req.json()

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query é obrigatória' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Gerar embedding da query
    const embeddingResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: query,
        dimensions: EMBEDDING_DIMENSION,
      }),
    })

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text()
      throw new Error(`Erro ao gerar embedding: ${error}`)
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // Buscar na base de conhecimento
    // Nota: O Supabase JS client converte array para vector automaticamente nas RPC calls
    let searchFunction = 'search_knowledge_base'
    let rpcParams: any = {
      query_embedding: queryEmbedding, // Passar array diretamente
      match_threshold,
      match_count,
      filter_metadata: filter_metadata || {},
    }
    
    if (use_hybrid) {
      searchFunction = 'search_knowledge_base_hybrid'
      rpcParams.query_text = query // Adicionar query_text para busca híbrida
    }

    const { data: results, error: searchError } = await supabase.rpc(
      searchFunction,
      rpcParams
    )

    if (searchError) {
      throw new Error(`Erro na busca: ${searchError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        query,
        results: results || [],
        count: results?.length || 0,
        usage: embeddingData.usage,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Erro na função search-knowledge:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao buscar na base de conhecimento',
        details: error.toString()
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

