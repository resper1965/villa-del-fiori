import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Configuração do AI Gateway
const AI_GATEWAY_URL = process.env.VERCEL_AI_GATEWAY_URL || 'https://gateway.vercel.ai/v1'
const AI_GATEWAY_KEY = process.env.VERCEL_AI_GATEWAY_KEY

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente Supabase com service role (para acesso completo)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Modelos
const EMBEDDING_MODEL = 'text-embedding-3-small'
const CHAT_MODEL = 'gpt-4o-mini'
const EMBEDDING_DIMENSION = 1536

/**
 * Gera embedding usando AI Gateway
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!AI_GATEWAY_KEY) {
    throw new Error('VERCEL_AI_GATEWAY_KEY não configurada')
  }

  const response = await fetch(`${AI_GATEWAY_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_GATEWAY_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSION,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao gerar embedding: ${error}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

/**
 * Busca chunks relevantes na base de conhecimento
 */
async function searchKnowledgeBase(
  queryEmbedding: number[],
  matchCount: number = 5,
  queryText?: string
) {
  // Tentar busca híbrida primeiro (se disponível)
  if (queryText) {
    try {
      const { data: hybridData, error: hybridError } = await supabaseAdmin.rpc(
        'search_knowledge_base_hybrid',
        {
          query_embedding: queryEmbedding,
          query_text: queryText,
          match_threshold: 0.7,
          match_count: matchCount,
          filter_metadata: {},
        }
      )

      if (!hybridError && hybridData) {
        return hybridData
      }
    } catch (error) {
      // Função não encontrada, continuar com fallback
      console.log('Busca híbrida não disponível, usando busca vetorial simples')
    }
  }

  // Fallback para busca vetorial simples
  const { data, error } = await supabaseAdmin.rpc('match_knowledge_base_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: matchCount,
  })

  if (error) {
    console.error('Erro ao buscar na base de conhecimento:', error)
    return []
  }

  return data || []
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação via Supabase
    // Criar cliente Supabase para validar sessão
    const supabaseAuth = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Obter token do header Authorization
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
      
      if (error || !user) {
        return new NextResponse('Não autorizado', { status: 401 })
      }
    } else {
      // Se não houver token no header, retornar erro
      return new NextResponse('Token de autenticação necessário', { status: 401 })
    }

    // Parse do body (formato do AI SDK UI)
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Mensagens são obrigatórias', { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      return new Response('Última mensagem deve ser do usuário', { status: 400 })
    }

    // Verificar configuração do AI Gateway
    if (!AI_GATEWAY_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI Gateway não configurado' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 1. Gerar embedding da pergunta
    let queryEmbedding: number[]
    try {
      queryEmbedding = await generateEmbedding(lastMessage.content)
    } catch (error: any) {
      console.error('Erro ao gerar embedding:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao processar pergunta' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2. Buscar chunks relevantes na base de conhecimento
    const relevantChunks = await searchKnowledgeBase(queryEmbedding, 5, lastMessage.content)

    // 3. Construir contexto
    let context = ''
    if (relevantChunks.length > 0) {
      context = relevantChunks
        .map((chunk: any) => {
          const source = chunk.metadata?.process_name || chunk.metadata?.document_title || chunk.process_name || 'Documento'
          return `[Fonte: ${source}]\n${chunk.content}`
        })
        .join('\n\n---\n\n')
    }

    // 4. Construir mensagens para o LLM
    const systemMessage = {
      role: 'system' as const,
      content: `Você é a Gabi, Síndica Virtual do Condomínio Villa Dei Fiori. 
Você é uma assistente inteligente que ajuda moradores, síndicos e administradores com informações sobre processos condominiais.

INSTRUÇÕES:
- Seja sempre educada, profissional e prestativa
- Use APENAS as informações fornecidas no contexto para responder
- Se não souber a resposta, diga que não tem essa informação e sugira consultar a documentação
- Cite as fontes quando usar informações específicas
- Responda em português brasileiro
- Seja concisa mas completa

${context ? `\nCONTEXTO DISPONÍVEL:\n${context}` : '\nNenhum contexto específico disponível. Use seu conhecimento geral sobre gestão condominial.'}`,
    }

    // Preparar mensagens do histórico (últimas 10 para não exceder contexto)
    // AI SDK UI já formata as mensagens corretamente
    const recentMessages = messages.slice(-10).map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    // 5. Configurar OpenAI com AI Gateway
    // Usar AI Gateway URL como base URL customizada
    // Nota: AI SDK suporta baseURL customizada
    const openaiProvider = createOpenAI({
      baseURL: AI_GATEWAY_URL,
      apiKey: AI_GATEWAY_KEY || '',
    })

    // 6. Stream resposta
    const result = await streamText({
      model: openaiProvider(CHAT_MODEL),
      messages: [systemMessage, ...recentMessages],
      temperature: 0.7,
      maxOutputTokens: 2000,
    })

    // 7. Retornar stream
    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('Erro no endpoint de chat:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao processar chat' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Handler para OPTIONS (CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, content-type',
    },
  })
}

