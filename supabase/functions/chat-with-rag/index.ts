// Edge Function: Chat with RAG
// Descrição: Chat com Retrieval-Augmented Generation usando base de conhecimento
// Uso: Recebe mensagem do usuário, busca contexto relevante e gera resposta com LLM

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings'
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const EMBEDDING_MODEL = Deno.env.get('EMBEDDING_MODEL') || 'text-embedding-3-small'
const CHAT_MODEL = Deno.env.get('CHAT_MODEL') || 'gpt-4o-mini'
const EMBEDDING_DIMENSION = 1536

interface ChatRequest {
  message: string
  conversation_id?: string
  user_id?: string
  match_threshold?: number
  match_count?: number
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
      message,
      conversation_id,
      user_id,
      match_threshold = 0.7,
      match_count = 5,
      use_hybrid = true
    }: ChatRequest = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 1. Gerar embedding da mensagem
    const embeddingResponse = await fetch(OPENAI_EMBEDDING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: message,
        dimensions: EMBEDDING_DIMENSION,
      }),
    })

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text()
      throw new Error(`Erro ao gerar embedding: ${error}`)
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // 2. Buscar contexto relevante na base de conhecimento
    // Nota: O Supabase JS client converte array para vector automaticamente nas RPC calls
    const searchFunction = use_hybrid ? 'search_knowledge_base_hybrid' : 'search_knowledge_base'
    
    const { data: searchResults, error: searchError } = await supabase.rpc(
      searchFunction,
      {
        query_embedding: queryEmbedding, // Passar array diretamente
        query_text: message, // Para busca híbrida
        match_threshold,
        match_count,
        filter_metadata: {},
      }
    )

    if (searchError) {
      console.error('Erro na busca:', searchError)
      // Continuar mesmo sem resultados, mas avisar
    }

    // 3. Preparar contexto para o LLM
    let context = ''
    const sources: Array<{ process_id: string; process_name: string; chunk_type: string; similarity: number }> = []

    if (searchResults && searchResults.length > 0) {
      context = searchResults
        .map((result: any, index: number) => {
          sources.push({
            process_id: result.process_id,
            process_name: result.process_name || 'Processo',
            chunk_type: result.chunk_type || 'content',
            similarity: result.similarity || result.combined_score || 0,
          })
          
          return `[Fonte ${index + 1}: ${result.process_name || 'Processo'}]\n${result.content}`
        })
        .join('\n\n---\n\n')
    }

    // 4. Preparar prompt para o LLM
    const systemPrompt = `Você é a Gabi, Síndica Virtual do Condomínio Villa Dei Fiori. 
Sua função é ajudar moradores e stakeholders respondendo perguntas sobre processos, regras e procedimentos do condomínio.

INSTRUÇÕES:
- Use APENAS as informações fornecidas no contexto abaixo para responder
- Se a informação não estiver no contexto, diga que não tem essa informação disponível e sugira contatar o síndico
- Seja clara, objetiva e prestativa
- Use linguagem formal mas acessível
- Sempre cite as fontes quando usar informações do contexto
- Se houver múltiplas fontes, mencione todas relevantes

CONTEXTO (processos aprovados do condomínio):
${context || 'Nenhum processo relevante encontrado na base de conhecimento.'}`

    const userPrompt = message

    // 5. Chamar OpenAI Chat API
    const chatResponse = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!chatResponse.ok) {
      const error = await chatResponse.text()
      throw new Error(`Erro ao gerar resposta: ${error}`)
    }

    const chatData = await chatResponse.json()
    const assistantMessage = chatData.choices[0].message.content

    // 6. Salvar mensagens no banco (se conversation_id fornecido)
    if (conversation_id && user_id) {
      // Salvar mensagem do usuário
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id,
          user_id,
          role: 'user',
          content: message,
        })

      // Salvar resposta do assistente
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id,
          user_id,
          role: 'assistant',
          content: assistantMessage,
          sources: sources.length > 0 ? sources : null,
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: assistantMessage,
        sources: sources,
        context_used: context.length > 0,
        usage: {
          embedding: embeddingData.usage,
          chat: chatData.usage,
        },
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
    console.error('Erro na função chat-with-rag:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar chat',
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





