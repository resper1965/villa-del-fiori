# Plano Detalhado: Implementação AI Gateway + AI SDK UI

**Data**: 2025-01-15  
**Objetivo**: Migrar sistema de chat para usar AI Gateway da Vercel e AI SDK UI

---

## 📋 Visão Geral

Este plano detalha a implementação completa de:
1. **AI Gateway da Vercel**: Unificação de endpoints, monitoramento e controle de custos
2. **AI SDK UI**: Streaming de respostas e código mais limpo no frontend

**Benefícios Esperados**:
- ✅ Streaming de respostas em tempo real
- ✅ Monitoramento de custos centralizado
- ✅ Código 40-60% mais limpo
- ✅ Persistência de conversas
- ✅ Alta confiabilidade com fallback automático

**Tempo Estimado**: 8-12 horas

---

## 🎯 Fase 1: Configuração do AI Gateway

### 1.1. Criar AI Gateway no Dashboard da Vercel

**Tempo**: 15 minutos

**Passos**:

1. Acessar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecionar o projeto `villadelfiori` (ou criar se necessário)
3. Navegar para **AI** → **AI Gateway**
4. Clicar em **"Create Gateway"** ou **"Get Started"**
5. Configurar:
   - **Nome**: `gabi-ai-gateway` (ou similar)
   - **Provider Principal**: OpenAI
   - **Modelos**: 
     - `text-embedding-3-small` (embeddings)
     - `gpt-4o-mini` (chat)

### 1.2. Configurar Provedores

**Tempo**: 10 minutos

**Passos**:

1. No AI Gateway, adicionar provedor **OpenAI**:
   - **API Key**: Usar chave existente ou criar nova
   - **Modelos disponíveis**: Selecionar modelos necessários
   - **Configurar como provedor principal**

2. (Opcional) Adicionar provedores de fallback:
   - **Anthropic** (Claude)
   - **Google** (Gemini)
   - **Groq** (para velocidade)

### 1.3. Configurar Orçamentos e Alertas

**Tempo**: 10 minutos

**Passos**:

1. Configurar orçamentos por modelo:
   - **Embeddings** (`text-embedding-3-small`): $50/mês
   - **Chat** (`gpt-4o-mini`): $100/mês
   - **Total**: $150/mês

2. Configurar alertas:
   - Alerta em 80% do orçamento
   - Alerta em 95% do orçamento
   - Bloqueio automático em 100%

3. Configurar notificações:
   - Email para alertas
   - Webhook (opcional)

### 1.4. Obter Credenciais

**Tempo**: 5 minutos

**Passos**:

1. No AI Gateway, navegar para **Settings** → **Authentication**
2. Copiar:
   - **Gateway URL**: Endpoint do gateway (ex: `https://gateway.vercel.ai/v1`)
   - **API Key**: Chave de autenticação do gateway
3. Anotar credenciais em local seguro

**Resultado Esperado**:
- ✅ AI Gateway configurado
- ✅ Provedores configurados
- ✅ Orçamentos e alertas configurados
- ✅ Credenciais obtidas

---

## 🎯 Fase 2: Instalação de Dependências

### 2.1. Instalar AI SDK

**Tempo**: 5 minutos

**Comando**:
```bash
cd frontend
npm install ai @ai-sdk/openai
```

**Dependências Adicionadas**:
- `ai`: AI SDK Core e UI (~500KB)
- `@ai-sdk/openai`: Provider OpenAI para AI SDK

### 2.2. Verificar Versões

**Tempo**: 2 minutos

**Verificar**:
- Node.js 20+ (já instalado)
- Next.js 14+ (já instalado)
- React 18+ (já instalado)

**Resultado Esperado**:
- ✅ Dependências instaladas
- ✅ Versões compatíveis verificadas

---

## 🎯 Fase 3: Criar API Route para Chat com Streaming

### 3.1. Criar Estrutura de Arquivos

**Tempo**: 5 minutos

**Arquivo**: `frontend/src/app/api/chat/route.ts`

### 3.2. Implementar API Route

**Tempo**: 2-3 horas

**Funcionalidades**:
1. Receber mensagens do frontend
2. Buscar contexto na base de conhecimento (Supabase)
3. Gerar embedding da pergunta (via AI Gateway)
4. Buscar chunks relevantes
5. Chamar LLM com streaming (via AI Gateway)
6. Retornar stream para o frontend

**Código Completo**:

```typescript
// frontend/src/app/api/chat/route.ts
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Configuração do AI Gateway
const AI_GATEWAY_URL = process.env.VERCEL_AI_GATEWAY_URL || 'https://gateway.vercel.ai/v1'
const AI_GATEWAY_KEY = process.env.VERCEL_AI_GATEWAY_KEY

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente Supabase com service role (para acesso completo)
// Usar service role para buscar na base de conhecimento
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
    const { data: hybridData, error: hybridError } = await supabaseAdmin.rpc(
      'search_knowledge_base_hybrid',
      {
        query_embedding: queryEmbedding,
        query_text: queryText,
        match_threshold: 0.7,
        match_count: matchCount,
        filter_metadata: {},
      }
    ).catch(() => ({ data: null, error: { message: 'Function not found' } }))

    if (!hybridError && hybridData) {
      return hybridData
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
    // Verificar autenticação via header Authorization
    // O AI SDK UI pode passar o token do Supabase no header
    const authHeader = req.headers.get('authorization')
    
    // Se não houver header, tentar validar via Supabase client
    // (opcional, dependendo da configuração de segurança)
    
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
          const source = chunk.metadata?.process_name || chunk.metadata?.document_title || 'Documento'
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
    const openaiClient = openai({
      baseURL: AI_GATEWAY_URL,
      apiKey: AI_GATEWAY_KEY,
    })

    // 6. Stream resposta
    const result = await streamText({
      model: openaiClient(CHAT_MODEL),
      messages: [systemMessage, ...recentMessages],
      temperature: 0.7,
      maxTokens: 2000,
    })

    // 7. Retornar stream
    return result.toDataStreamResponse({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  } catch (error: any) {
    console.error('Erro no endpoint de chat:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao processar chat' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
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
```

### 3.3. Configurar Variáveis de Ambiente

**Tempo**: 5 minutos

**Arquivo**: `.env.local` (desenvolvimento) e Vercel Dashboard (produção)

**Variáveis Necessárias**:
```env
# AI Gateway
VERCEL_AI_GATEWAY_URL=https://gateway.vercel.ai/v1
VERCEL_AI_GATEWAY_KEY=vgw_...

# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Configurar na Vercel**:
1. Dashboard → Project → Settings → Environment Variables
2. Adicionar `VERCEL_AI_GATEWAY_URL`
3. Adicionar `VERCEL_AI_GATEWAY_KEY` (marcar como Sensitive)
4. Adicionar `SUPABASE_SERVICE_ROLE_KEY` (marcar como Sensitive)

**Resultado Esperado**:
- ✅ API route criada
- ✅ Integração com AI Gateway
- ✅ Integração com base de conhecimento
- ✅ Streaming funcionando

---

## 🎯 Fase 4: Adaptar Edge Functions para AI Gateway

### 4.1. Atualizar `ingest-process`

**Tempo**: 1 hora

**Arquivo**: `supabase/functions/ingest-process/index.ts`

**Mudanças**:
- Alterar endpoint de `https://api.openai.com/v1/embeddings` para AI Gateway
- Alterar autenticação de `OPENAI_API_KEY` para `VERCEL_AI_GATEWAY_KEY`

**Código de Exemplo**:

```typescript
// Substituir
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings'

// Por
const AI_GATEWAY_URL = Deno.env.get('VERCEL_AI_GATEWAY_URL') || 'https://gateway.vercel.ai/v1'
const AI_GATEWAY_KEY = Deno.env.get('VERCEL_AI_GATEWAY_KEY')

// Na função de gerar embedding
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
```

### 4.2. Atualizar `ingest-document`

**Tempo**: 1 hora

**Arquivo**: `supabase/functions/ingest-document/index.ts`

**Mudanças**: Mesmas do `ingest-process`

**Código de Exemplo**:

```typescript
// ANTES (linha ~8)
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")

// DEPOIS
const AI_GATEWAY_URL = Deno.env.get('VERCEL_AI_GATEWAY_URL') || 'https://gateway.vercel.ai/v1'
const AI_GATEWAY_KEY = Deno.env.get('VERCEL_AI_GATEWAY_KEY')

// Na função de gerar embedding (linha ~98)
// ANTES
const response = await fetch("https://api.openai.com/v1/embeddings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
  },
  // ...
})

// DEPOIS
if (!AI_GATEWAY_KEY) {
  throw new Error('VERCEL_AI_GATEWAY_KEY não configurada')
}

const response = await fetch(`${AI_GATEWAY_URL}/embeddings`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${AI_GATEWAY_KEY}`,
  },
  // ...
})
```

### 4.3. Atualizar Secrets no Supabase

**Tempo**: 5 minutos

**Passos**:
1. Supabase Dashboard → Edge Functions → Settings
2. Remover `OPENAI_API_KEY` (se existir)
3. Adicionar `VERCEL_AI_GATEWAY_URL`
4. Adicionar `VERCEL_AI_GATEWAY_KEY` (marcar como Secret)

**Resultado Esperado**:
- ✅ Edge Functions atualizadas
- ✅ Usando AI Gateway para embeddings
- ✅ Secrets configurados

---

## 🎯 Fase 5: Refatorar Frontend com AI SDK UI

### 5.1. Criar Hook Customizado (Opcional)

**Tempo**: 30 minutos

**Arquivo**: `frontend/src/lib/hooks/useChatWithRAG.ts`

**Funcionalidade**: Wrapper do `useChat` com lógica específica do projeto

```typescript
// frontend/src/lib/hooks/useChatWithRAG.ts
import { useChat } from 'ai/react'
import { useAuth } from '@/contexts/AuthContext'

export function useChatWithRAG() {
  const { user } = useAuth()

  const chat = useChat({
    api: '/api/chat',
    body: {
      conversationId: `conv-${user?.id || 'anonymous'}-${Date.now()}`,
      userId: user?.id,
    },
    onResponse: (response) => {
      // Callback opcional para processar resposta
      console.log('Resposta recebida:', response)
    },
    onError: (error) => {
      console.error('Erro no chat:', error)
    },
  })

  return chat
}
```

### 5.2. Refatorar Componente de Chat

**Tempo**: 2-3 horas

**Arquivo**: `frontend/src/app/(dashboard)/chat/page.tsx`

**Código Completo Refatorado**:

```typescript
"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useRBAC } from "@/lib/hooks/useRBAC"
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useChat } from 'ai/react'
import { supabase } from '@/lib/supabase/client'

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { canAccessChat } = useRBAC()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Usar useChat do AI SDK UI
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      conversationId: `conv-${user?.id || 'anonymous'}-${Date.now()}`,
      userId: user?.id,
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Olá! Sou a Gabi, Síndica Virtual do Condomínio Villa Dei Fiori. Como posso ajudá-lo hoje?',
      },
    ],
    onError: (error) => {
      console.error('Erro no chat:', error)
    },
  })

  // Redirecionar se não pode acessar chat
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !canAccessChat())) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (!canAccessChat()) {
        router.push("/auth/unauthorized")
      }
    }
  }, [authLoading, isAuthenticated, canAccessChat, router])

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (authLoading || !isAuthenticated || !canAccessChat()) {
    return (
      <div className="h-[calc(100vh-73px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground stroke-1" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary stroke-1" />
          </div>
          <div>
            <h1 className="text-base font-medium text-foreground">Gabi</h1>
            <p className="text-xs text-muted-foreground">Síndica Virtual</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary stroke-1" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-foreground stroke-1" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary stroke-1" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground stroke-1" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-3 justify-start">
            <div className="bg-destructive/10 text-destructive rounded-2xl px-4 py-2">
              <p className="text-sm">Erro: {error.message}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 min-h-[44px]"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="min-w-[44px] min-h-[44px] bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin stroke-1" />
            ) : (
              <Send className="h-5 w-5 stroke-1" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

### 5.3. Remover Código Antigo

**Tempo**: 15 minutos

**Arquivos a Limpar**:
- `frontend/src/lib/api/chat.ts` - Pode ser removido ou mantido para compatibilidade
- Remover imports não utilizados

**Resultado Esperado**:
- ✅ Componente refatorado
- ✅ Streaming funcionando
- ✅ Código mais limpo (~150 linhas vs ~260 linhas)

---

## 🎯 Fase 6: Testes e Validação

### 6.1. Testes Locais

**Tempo**: 1-2 horas

**Checklist**:

1. **Testar API Route**:
   - [ ] Endpoint `/api/chat` responde corretamente
   - [ ] Streaming funciona (respostas aparecem em tempo real)
   - [ ] Busca na base de conhecimento funciona
   - [ ] Embeddings são gerados corretamente
   - [ ] Erros são tratados adequadamente

2. **Testar Frontend**:
   - [ ] Chat carrega corretamente
   - [ ] Mensagens são exibidas
   - [ ] Streaming funciona (texto aparece progressivamente)
   - [ ] Auto-scroll funciona
   - [ ] Loading states funcionam
   - [ ] Erros são exibidos

3. **Testar Edge Functions**:
   - [ ] `ingest-process` funciona com AI Gateway
   - [ ] `ingest-document` funciona com AI Gateway
   - [ ] Embeddings são gerados corretamente

### 6.2. Testes de Integração

**Tempo**: 1 hora

**Cenários**:
1. Enviar mensagem simples
2. Enviar mensagem que requer busca na base de conhecimento
3. Enviar múltiplas mensagens em sequência
4. Testar com base de conhecimento vazia
5. Testar com erro de rede
6. Testar com AI Gateway indisponível (fallback)

### 6.3. Validação de Performance

**Tempo**: 30 minutos

**Métricas**:
- Tempo de primeira resposta (TTFR)
- Velocidade de streaming
- Uso de memória
- Tamanho do bundle

**Resultado Esperado**:
- ✅ Todos os testes passando
- ✅ Streaming funcionando corretamente
- ✅ Performance adequada

---

## 🎯 Fase 7: Deploy e Monitoramento

### 7.1. Deploy do Frontend

**Tempo**: 15 minutos

**Passos**:
1. Commit de todas as mudanças
2. Push para repositório
3. Deploy automático na Vercel
4. Verificar build bem-sucedido

### 7.2. Deploy das Edge Functions

**Tempo**: 15 minutos

**Passos**:
1. Deploy de `ingest-process` atualizada
2. Deploy de `ingest-document` atualizada
3. Verificar logs de deploy

### 7.3. Configurar Monitoramento

**Tempo**: 30 minutos

**Passos**:
1. Verificar dashboard do AI Gateway:
   - Uso de tokens
   - Custo por modelo
   - Taxa de sucesso
   - Latência

2. Configurar alertas:
   - Erros de API
   - Latência alta
   - Uso excessivo

3. Verificar logs:
   - Logs da Vercel (API routes)
   - Logs do Supabase (Edge Functions)

**Resultado Esperado**:
- ✅ Deploy concluído
- ✅ Sistema funcionando em produção
- ✅ Monitoramento configurado

---

## 🎯 Fase 8: Documentação e Limpeza

### 8.1. Atualizar Documentação

**Tempo**: 30 minutos

**Arquivos a Atualizar**:
- `docs/CONFIGURAR_OPENAI_API_KEY.md` → Atualizar para AI Gateway
- `docs/BASE_CONHECIMENTO.md` → Mencionar AI Gateway
- `README.md` → Atualizar instruções de setup

### 8.2. Limpeza de Código

**Tempo**: 15 minutos

**Ações**:
- Remover código comentado
- Remover imports não utilizados
- Verificar linter errors
- Atualizar comentários

**Resultado Esperado**:
- ✅ Documentação atualizada
- ✅ Código limpo

---

## 📊 Cronograma Detalhado

| Fase | Descrição | Tempo | Dependências |
|------|-----------|-------|--------------|
| **1** | Configuração do AI Gateway | 40 min | - |
| **2** | Instalação de Dependências | 7 min | Fase 1 |
| **3** | Criar API Route | 2-3h | Fase 1, 2 |
| **4** | Adaptar Edge Functions | 1h 10min | Fase 1 |
| **5** | Refatorar Frontend | 3h 15min | Fase 3 |
| **6** | Testes e Validação | 2h 30min | Fase 3, 4, 5 |
| **7** | Deploy e Monitoramento | 1h | Fase 6 |
| **8** | Documentação | 45 min | Fase 7 |
| **TOTAL** | | **8-12 horas** | |

---

## 🔧 Configurações Necessárias

### Variáveis de Ambiente

#### Frontend (`.env.local` e Vercel)

```env
# AI Gateway
VERCEL_AI_GATEWAY_URL=https://gateway.vercel.ai/v1
VERCEL_AI_GATEWAY_KEY=vgw_...

# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

#### Supabase Edge Functions

```env
# AI Gateway
VERCEL_AI_GATEWAY_URL=https://gateway.vercel.ai/v1
VERCEL_AI_GATEWAY_KEY=vgw_...

# Supabase (já existentes)
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🧪 Checklist de Validação

### Pré-Implementação

- [ ] AI Gateway criado e configurado
- [ ] Credenciais obtidas
- [ ] Orçamentos configurados
- [ ] Dependências instaladas

### Durante Implementação

- [ ] API route criada e testada localmente
- [ ] Edge Functions atualizadas
- [ ] Frontend refatorado
- [ ] Streaming funcionando
- [ ] Busca na base de conhecimento funcionando

### Pós-Implementação

- [ ] Deploy concluído
- [ ] Testes em produção passando
- [ ] Monitoramento configurado
- [ ] Documentação atualizada
- [ ] Código limpo e revisado

---

## 🚨 Troubleshooting

### Problema: AI Gateway retorna 401

**Solução**:
- Verificar `VERCEL_AI_GATEWAY_KEY` está correta
- Verificar formato do header Authorization
- Verificar se a chave tem permissões corretas

### Problema: Streaming não funciona

**Solução**:
- Verificar se API route retorna `toDataStreamResponse()`
- Verificar se frontend usa `useChat` corretamente
- Verificar CORS headers

### Problema: Embeddings não são gerados

**Solução**:
- Verificar `VERCEL_AI_GATEWAY_KEY` nas Edge Functions
- Verificar logs das Edge Functions
- Verificar se modelo está disponível no AI Gateway

### Problema: Base de conhecimento não retorna resultados

**Solução**:
- Verificar se função `match_knowledge_base_documents` existe
- Verificar se há documentos indexados
- Verificar threshold de similaridade

---

## 📈 Métricas de Sucesso

### Antes da Implementação

- ❌ Sem streaming (respostas completas)
- ❌ ~260 linhas de código no chat
- ❌ Sem monitoramento de custos
- ❌ Sem persistência de conversas

### Após Implementação

- ✅ Streaming funcionando
- ✅ ~150 linhas de código (redução de 40%)
- ✅ Monitoramento de custos no AI Gateway
- ✅ Persistência de conversas (se implementada)
- ✅ Código mais limpo e manutenível

---

## 🔗 Referências

- [AI Gateway Documentation](https://vercel.com/docs/ai-gateway)
- [AI SDK UI Documentation](https://ai-sdk.dev/docs/ai-sdk-ui/overview)
- [useChat Hook Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [AI SDK Core Documentation](https://ai-sdk.dev/docs)

---

## 📝 Notas Importantes

1. **Backup**: Fazer backup do código atual antes de começar
2. **Branch**: Criar branch separada para implementação
3. **Testes Incrementais**: Testar cada fase antes de prosseguir
4. **Rollback**: Manter código antigo comentado inicialmente para rollback rápido
5. **Monitoramento**: Acompanhar métricas do AI Gateway após deploy

---

**Última Atualização**: 2025-01-15

