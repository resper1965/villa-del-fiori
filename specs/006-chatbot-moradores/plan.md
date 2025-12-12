# Technical Plan: Chatbot Inteligente para Moradores

**Feature**: 006-chatbot-moradores  
**Status**: Planning  
**Created**: 2024-12-08

## Overview

Chatbot inteligente que responde perguntas dos moradores baseado no conteúdo dos processos aprovados, usando RAG (Retrieval-Augmented Generation) para garantir respostas precisas.

## Architecture

### Componentes Principais

1. **Frontend - Interface de Chat**
   - Componente React de chat
   - WebSocket ou polling para mensagens
   - Gerenciamento de estado de conversação
   - Renderização de markdown e links

2. **Backend - API de Chat**
   - Supabase Edge Functions
   - Gerenciamento de sessões
   - Integração com RAG system
   - Integração com LLM

3. **RAG System** (depende de spec 005)
   - Busca semântica na base de conhecimento
   - Retrieval de processos relevantes
   - Preparação de contexto

4. **LLM Integration**
   - OpenAI GPT-4, Anthropic Claude, ou modelo local (Ollama)
   - Prompt engineering
   - Gerenciamento de tokens

## Technology Stack

**Frontend:**
- Next.js 14, React, TypeScript
- Componente de chat (react-chatbot-kit ou custom)
- Markdown renderer (react-markdown)
- WebSocket client (opcional)

**Backend:**
- Supabase Edge Functions (Deno/TypeScript)
- WebSocket support (opcional, via Supabase Realtime)

**LLM:**
- OpenAI GPT-4 (recomendado para produção)
- Anthropic Claude (alternativa)
- Ollama com modelo local (alternativa sem custo)

**RAG:**
- Base de conhecimento (spec 005)
- Vector database (pgvector ou Pinecone)
- Embeddings (OpenAI ou sentence-transformers)

## Implementation Phases

### Phase 1: MVP - Chatbot Básico
- Interface de chat simples
- Integração com RAG
- Respostas baseadas em processos
- Histórico básico de conversas

### Phase 2: Melhorias de UX
- Perguntas frequentes
- Sugestões de perguntas
- Indicador de digitação
- Links clicáveis em respostas

### Phase 3: Funcionalidades Avançadas
- Escalação para humano
- Personalização por morador
- Aprendizado contínuo
- Analytics

## Database Schema

**Tabela de Conversas:**
```sql
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Tabela de Mensagens:**
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES chat_conversations(id),
    role TEXT, -- 'user' ou 'assistant'
    content TEXT,
    sources JSONB, -- Processos usados como fonte
    metadata JSONB,
    created_at TIMESTAMP
);
```

**Tabela de Perguntas Frequentes:**
```sql
CREATE TABLE chat_faq (
    id UUID PRIMARY KEY,
    question TEXT,
    answer TEXT,
    sources JSONB,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## API Contracts

### POST /api/v1/chat/message

**Request:**
```json
{
  "conversation_id": "uuid", // opcional, cria nova se não fornecido
  "message": "Como reservo a academia?",
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "message_id": "uuid",
  "response": "Para reservar a academia...",
  "sources": [
    {
      "process_id": "uuid",
      "title": "Academia",
      "relevance": 0.95
    }
  ],
  "suggestions": [
    "Quais são os horários da academia?",
    "Preciso pagar para usar a academia?"
  ]
}
```

### GET /api/v1/chat/history

**Request:**
```
GET /api/v1/chat/history?conversation_id=uuid&limit=50
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Como reservo a academia?",
      "created_at": "2024-12-08T10:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Para reservar a academia...",
      "sources": [...],
      "created_at": "2024-12-08T10:00:01Z"
    }
  ]
}
```

### GET /api/v1/chat/faq

**Response:**
```json
{
  "faq": [
    {
      "id": "uuid",
      "question": "Como reservo área comum?",
      "answer": "Para reservar...",
      "usage_count": 150
    }
  ]
}
```

## Prompt Engineering

**System Prompt:**
```
Você é um assistente virtual do condomínio Villa Dei Fiori. 
Sua função é responder perguntas dos moradores baseado nos processos 
e regulamentos aprovados do condomínio.

INSTRUÇÕES:
- Responda apenas com base no contexto fornecido dos processos
- Se a informação não estiver no contexto, diga que não tem a informação
- Seja claro, objetivo e amigável
- Sempre cite os processos usados como fonte
- Use linguagem acessível para moradores
```

**User Prompt Template:**
```
Contexto dos processos:
{context_chunks}

Pergunta do morador:
{user_question}

Responda baseado apenas no contexto fornecido.
```

## RAG Flow

1. **Recebe pergunta do usuário**
2. **Gera embedding da pergunta**
3. **Busca processos relevantes** (similarity search, top-k=5)
4. **Prepara contexto** (chunks dos processos mais relevantes)
5. **Gera resposta com LLM** (usando contexto)
6. **Extrai citações** (processos usados)
7. **Retorna resposta** com fontes

## Performance Considerations

- Cache de respostas para perguntas frequentes
- Timeout de 10s para resposta do LLM
- Retry logic para falhas de API
- Rate limiting: 20 mensagens/minuto por usuário
- Streaming de respostas (opcional, para melhor UX)

## Cost Estimation

**OpenAI GPT-4:**
- Input: ~$0.03 por 1K tokens
- Output: ~$0.06 por 1K tokens
- Resposta média: 500 tokens input + 200 tokens output = ~$0.027
- 100 conversas/dia = ~$2.70/dia = ~$81/mês

**OpenAI GPT-3.5-turbo (alternativa mais barata):**
- Input: ~$0.0015 por 1K tokens
- Output: ~$0.002 por 1K tokens
- Resposta média: ~$0.001
- 100 conversas/dia = ~$0.10/dia = ~$3/mês

**Ollama (local, sem custo):**
- Requer servidor com GPU
- Latência maior (~5-10s)
- Sem custo de API

## Security Considerations

- Autenticação obrigatória
- Rate limiting por usuário
- Sanitização de input
- Validação de conteúdo gerado
- Logs de interações (sem dados sensíveis)

## Testing Strategy

- Unit tests para lógica de chat
- Integration tests para RAG flow
- E2E tests para fluxo completo
- Accuracy tests para respostas
- Performance tests para latência
- Load tests para múltiplos usuários

## Monitoring & Analytics

- Métricas: mensagens/dia, taxa de sucesso, latência
- Logs de interações (anônimos)
- Feedback de usuários (thumbs up/down)
- Tracking de perguntas frequentes
- Alertas para falhas de API

