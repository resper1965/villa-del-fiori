// Edge Function: Generate Embeddings
// Descrição: Gera embeddings para texto usando OpenAI API
// Uso: Recebe texto e retorna embedding vetorial

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings'
const EMBEDDING_MODEL = Deno.env.get('EMBEDDING_MODEL') || 'text-embedding-3-small'
const EMBEDDING_DIMENSION = 1536

interface EmbeddingRequest {
  text: string
  metadata?: Record<string, any>
}

interface EmbeddingResponse {
  embedding: number[]
  model: string
  usage?: {
    prompt_tokens: number
    total_tokens: number
  }
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

    // Parse request body
    const { text, metadata }: EmbeddingRequest = await req.json()

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Texto é obrigatório' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Chamar OpenAI API para gerar embedding
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
        dimensions: EMBEDDING_DIMENSION,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('Erro ao chamar OpenAI API:', error)
      throw new Error(`Erro ao gerar embedding: ${error}`)
    }

    const openaiData = await openaiResponse.json()
    const embedding = openaiData.data[0].embedding

    const response: EmbeddingResponse = {
      embedding,
      model: EMBEDDING_MODEL,
      usage: openaiData.usage,
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Erro na função generate-embeddings:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao gerar embedding',
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





