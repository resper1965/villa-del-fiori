import { supabase } from '@/lib/supabase/client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    process_id: string
    process_name: string
    chunk_type: string
    similarity: number
  }>
}

export interface ChatResponse {
  success: boolean
  message: string
  sources?: Array<{
    process_id: string
    process_name: string
    chunk_type: string
    similarity: number
  }>
  context_used?: boolean
  usage?: {
    embedding?: {
      prompt_tokens: number
      total_tokens: number
    }
    chat?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
  error?: string
}

/**
 * Envia mensagem para o chat com RAG
 */
export async function sendChatMessage(
  message: string,
  conversationId?: string,
  userId?: string
): Promise<ChatResponse> {
  try {
    // Obter usuário atual se não fornecido
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const finalUserId = userId || user?.id
    const finalConversationId = conversationId || `conv-${Date.now()}`

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke('chat-with-rag', {
      body: {
        message,
        conversation_id: finalConversationId,
        user_id: finalUserId,
        match_threshold: 0.7,
        match_count: 5,
        use_hybrid: true,
      },
    })

    if (error) {
      console.error('Erro ao chamar chat-with-rag:', error)
      return {
        success: false,
        message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        error: error.message,
      }
    }

    return data as ChatResponse
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error)
    return {
      success: false,
      message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
      error: error.message,
    }
  }
}

/**
 * Busca na base de conhecimento (sem chat)
 */
export async function searchKnowledge(
  query: string,
  matchThreshold: number = 0.7,
  matchCount: number = 10
) {
  try {
    const { data, error } = await supabase.functions.invoke('search-knowledge', {
      body: {
        query,
        match_threshold: matchThreshold,
        match_count: matchCount,
        use_hybrid: true,
      },
    })

    if (error) {
      throw error
    }

    return data
  } catch (error: any) {
    console.error('Erro ao buscar na base de conhecimento:', error)
    throw error
  }
}





