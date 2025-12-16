// Edge Function: Ingest Process
// Descrição: Ingere um processo aprovado na base de conhecimento, gerando chunks e embeddings
// Uso: Recebe process_id e process_version_id, gera chunks, embeddings e salva na base

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// AI Gateway (prioridade) ou OpenAI direto (fallback)
const AI_GATEWAY_URL = Deno.env.get('VERCEL_AI_GATEWAY_URL') || 'https://gateway.vercel.ai/v1'
const AI_GATEWAY_KEY = Deno.env.get('VERCEL_AI_GATEWAY_KEY')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') // Fallback
const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings'
const EMBEDDING_MODEL = Deno.env.get('EMBEDDING_MODEL') || 'text-embedding-3-small'
const EMBEDDING_DIMENSION = 1536

// Usar AI Gateway se configurado, senão usar OpenAI direto
const EMBEDDING_API_URL = AI_GATEWAY_KEY ? `${AI_GATEWAY_URL}/embeddings` : OPENAI_API_URL
const EMBEDDING_API_KEY = AI_GATEWAY_KEY || OPENAI_API_KEY

interface IngestRequest {
  process_id: string
  process_version_id: string
}

interface Chunk {
  chunk_index: number
  chunk_type: 'name' | 'description' | 'workflow' | 'entities' | 'variables' | 'raci' | 'content'
  content: string
  metadata: Record<string, any>
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
    // Verificar API key (AI Gateway ou OpenAI)
    if (!EMBEDDING_API_KEY) {
      throw new Error('VERCEL_AI_GATEWAY_KEY ou OPENAI_API_KEY não configurada')
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { process_id, process_version_id }: IngestRequest = await req.json()

    if (!process_id || !process_version_id) {
      return new Response(
        JSON.stringify({ error: 'process_id e process_version_id são obrigatórios' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Atualizar status para 'processing'
    await supabase
      .from('knowledge_base_ingestion_status')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('process_id', process_id)
      .eq('process_version_id', process_version_id)

    // Buscar processo e versão
    const { data: process, error: processError } = await supabase
      .from('processes')
      .select('*')
      .eq('id', process_id)
      .single()

    if (processError || !process) {
      throw new Error(`Processo não encontrado: ${processError?.message}`)
    }

    const { data: processVersion, error: versionError } = await supabase
      .from('process_versions')
      .select('*')
      .eq('id', process_version_id)
      .single()

    if (versionError || !processVersion) {
      throw new Error(`Versão do processo não encontrada: ${versionError?.message}`)
    }

    // Verificar se processo está aprovado
    if (process.status !== 'aprovado') {
      throw new Error(`Processo não está aprovado (status: ${process.status})`)
    }

    // Remover chunks antigos deste processo/versão
    await supabase
      .from('knowledge_base_documents')
      .delete()
      .eq('process_id', process_id)
      .eq('process_version_id', process_version_id)

    // Gerar chunks do processo
    const chunks: Chunk[] = []
    const content = processVersion.content || {}

    // Chunk: Nome do processo
    if (process.name) {
      chunks.push({
        chunk_index: 0,
        chunk_type: 'name',
        content: process.name,
        metadata: {
          category: process.category,
          document_type: process.document_type,
        },
      })
    }

    // Chunk: Descrição
    if (content.description) {
      chunks.push({
        chunk_index: chunks.length,
        chunk_type: 'description',
        content: typeof content.description === 'string' 
          ? content.description 
          : JSON.stringify(content.description),
        metadata: {
          category: process.category,
          document_type: process.document_type,
        },
      })
    }

    // Chunk: Workflow
    if (content.workflow && Array.isArray(content.workflow)) {
      const workflowText = content.workflow
        .map((step: any, index: number) => {
          if (typeof step === 'string') return `${index + 1}. ${step}`
          return `${index + 1}. ${step.step || step.description || JSON.stringify(step)}`
        })
        .join('\n')
      
      chunks.push({
        chunk_index: chunks.length,
        chunk_type: 'workflow',
        content: workflowText,
        metadata: {
          category: process.category,
          document_type: process.document_type,
          workflow_steps: content.workflow.length,
        },
      })
    }

    // Chunk: Entidades
    if (content.entities && Array.isArray(content.entities)) {
      chunks.push({
        chunk_index: chunks.length,
        chunk_type: 'entities',
        content: `Entidades envolvidas: ${content.entities.join(', ')}`,
        metadata: {
          category: process.category,
          entities: content.entities,
        },
      })
    }

    // Chunk: Variáveis
    if (content.variables && typeof content.variables === 'object') {
      const variablesText = Object.entries(content.variables)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      
      chunks.push({
        chunk_index: chunks.length,
        chunk_type: 'variables',
        content: variablesText,
        metadata: {
          category: process.category,
        },
      })
    }

    // Chunk: RACI
    if (content.raci && Array.isArray(content.raci)) {
      const raciText = content.raci
        .map((entry: any) => {
          if (typeof entry === 'string') return entry
          return `${entry.role || 'N/A'}: ${entry.responsible || 'N/A'}`
        })
        .join('\n')
      
      chunks.push({
        chunk_index: chunks.length,
        chunk_type: 'raci',
        content: raciText,
        metadata: {
          category: process.category,
        },
      })
    }

    // Chunk: Conteúdo completo (fallback)
    if (chunks.length === 0) {
      chunks.push({
        chunk_index: 0,
        chunk_type: 'content',
        content: JSON.stringify(content),
        metadata: {
          category: process.category,
          document_type: process.document_type,
        },
      })
    }

    // Gerar embeddings para cada chunk
    const documentsToInsert = []
    
    for (const chunk of chunks) {
      // Chamar AI Gateway ou OpenAI API para gerar embedding
      const embeddingResponse = await fetch(EMBEDDING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EMBEDDING_API_KEY}`,
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: chunk.content,
          dimensions: EMBEDDING_DIMENSION,
        }),
      })

      if (!embeddingResponse.ok) {
        const error = await embeddingResponse.text()
        console.error(`Erro ao gerar embedding para chunk ${chunk.chunk_index}:`, error)
        continue // Pular chunk com erro, mas continuar com os outros
      }

      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.data[0].embedding

      documentsToInsert.push({
        process_id,
        process_version_id,
        chunk_index: chunk.chunk_index,
        chunk_type: chunk.chunk_type,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding: embedding, // Supabase JS client converte array para vector automaticamente
      })
    }

    // Inserir documentos na base de conhecimento
    if (documentsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('knowledge_base_documents')
        .insert(documentsToInsert)

      if (insertError) {
        throw new Error(`Erro ao inserir documentos: ${insertError.message}`)
      }
    }

    // Atualizar status para 'completed'
    await supabase
      .from('knowledge_base_ingestion_status')
      .update({ 
        status: 'completed',
        chunks_count: documentsToInsert.length,
        completed_at: new Date().toISOString()
      })
      .eq('process_id', process_id)
      .eq('process_version_id', process_version_id)

    return new Response(
      JSON.stringify({
        success: true,
        process_id,
        process_version_id,
        chunks_ingested: documentsToInsert.length,
        message: 'Processo ingerido com sucesso na base de conhecimento',
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
    console.error('Erro na função ingest-process:', error)
    
    // Atualizar status para 'failed' se possível
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const body = await req.json().catch(() => ({}))
      if (body.process_id && body.process_version_id) {
        await supabase
          .from('knowledge_base_ingestion_status')
          .update({ 
            status: 'failed',
            error_message: error.message || error.toString()
          })
          .eq('process_id', body.process_id)
          .eq('process_version_id', body.process_version_id)
      }
    } catch (updateError) {
      console.error('Erro ao atualizar status de falha:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao ingerir processo',
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





