# Guia de Implementação: Base de Conhecimento (Spec 005)

**Data**: 2025-01-09  
**Status**: 🚧 Em Implementação

## ✅ O Que Foi Criado

### 1. Migrations SQL

#### `013_add_pgvector_extension.sql`
- Habilita extensão pgvector no Supabase
- Necessário para busca vetorial

#### `014_create_knowledge_base.sql`
- Cria tabela `knowledge_base_documents` para armazenar chunks com embeddings
- Cria tabela `knowledge_base_ingestion_status` para rastrear status de ingestão
- Cria índices para performance (vetorial, full-text, metadata)
- Cria triggers para atualização automática de timestamps

#### `015_create_ingestion_trigger.sql`
- Cria triggers que marcam processos aprovados para ingestão automática
- Quando processo muda para status 'aprovado', é marcado para ingestão

#### `016_create_search_functions.sql`
- Função `search_knowledge_base()`: Busca vetorial por similaridade
- Função `search_knowledge_base_hybrid()`: Busca híbrida (vetorial + full-text)
- Função `find_related_processes()`: Encontra processos relacionados

### 2. Edge Functions

#### `generate-embeddings/index.ts`
- Gera embeddings para texto usando OpenAI API
- Recebe texto e retorna embedding vetorial (1536 dimensões)

#### `ingest-process/index.ts`
- Ingere processo aprovado na base de conhecimento
- Gera chunks do processo (name, description, workflow, entities, variables, raci)
- Gera embeddings para cada chunk
- Salva na tabela `knowledge_base_documents`

#### `search-knowledge/index.ts`
- Busca semântica na base de conhecimento
- Recebe query text, gera embedding e busca documentos similares
- Suporta busca híbrida (vetorial + full-text)

#### `chat-with-rag/index.ts`
- Chat com Retrieval-Augmented Generation
- Busca contexto relevante na base de conhecimento
- Gera resposta usando LLM (GPT-4o-mini) com contexto
- Salva mensagens no banco de dados

## 📋 Próximos Passos

### 1. Aplicar Migrations no Supabase

```bash
# Via Supabase Dashboard SQL Editor ou MCP tools
# Aplicar em ordem:
1. 013_add_pgvector_extension.sql
2. 014_create_knowledge_base.sql
3. 015_create_ingestion_trigger.sql
4. 016_create_search_functions.sql
```

### 2. Configurar Variáveis de Ambiente

No Supabase Dashboard → Edge Functions → Settings:

```env
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
EMBEDDING_DIMENSION=1536
```

### 3. Deploy Edge Functions

```bash
# Via Supabase CLI
supabase functions deploy generate-embeddings
supabase functions deploy ingest-process
supabase functions deploy search-knowledge
supabase functions deploy chat-with-rag
```

### 4. Criar Índice Vetorial

**IMPORTANTE**: O índice IVFFlat precisa ser criado após ter dados na tabela.

```sql
-- Executar após primeira ingestão de processos
CREATE INDEX idx_kb_docs_embedding ON knowledge_base_documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### 5. Ingerir Processos Existentes

Criar script para ingerir processos já aprovados:

```typescript
// scripts/ingest_existing_processes.ts
// Buscar todos processos aprovados
// Chamar Edge Function ingest-process para cada um
```

### 6. Integrar com Frontend

Atualizar `frontend/src/lib/api/chat.ts` para usar a nova Edge Function `chat-with-rag`.

## 🧪 Testes

### Testar Geração de Embeddings

```bash
curl -X POST https://<project>.supabase.co/functions/v1/generate-embeddings \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Como reservo a academia?"}'
```

### Testar Ingestão

```bash
curl -X POST https://<project>.supabase.co/functions/v1/ingest-process \
  -H "Authorization: Bearer <service-role-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "process_id": "<process-id>",
    "process_version_id": "<version-id>"
  }'
```

### Testar Busca

```bash
curl -X POST https://<project>.supabase.co/functions/v1/search-knowledge \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Como reservo a academia?",
    "match_threshold": 0.7,
    "match_count": 5
  }'
```

### Testar Chat

```bash
curl -X POST https://<project>.supabase.co/functions/v1/chat-with-rag \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Como reservo a academia?",
    "conversation_id": "test-123",
    "user_id": "<user-id>"
  }'
```

## 📊 Monitoramento

### Verificar Status de Ingestão

```sql
SELECT 
  p.name,
  p.status,
  kb.status as ingestion_status,
  kb.chunks_count,
  kb.completed_at
FROM processes p
LEFT JOIN knowledge_base_ingestion_status kb ON kb.process_id = p.id
WHERE p.status = 'aprovado'
ORDER BY kb.completed_at DESC;
```

### Verificar Documentos Indexados

```sql
SELECT 
  COUNT(*) as total_chunks,
  COUNT(DISTINCT process_id) as total_processes,
  chunk_type,
  COUNT(*) as count_by_type
FROM knowledge_base_documents
GROUP BY chunk_type;
```

## 🔧 Troubleshooting

### Erro: "extensão vector não existe"
- Verificar se migration `013_add_pgvector_extension.sql` foi aplicada
- Verificar se extensão está habilitada no Supabase

### Erro: "OPENAI_API_KEY não configurada"
- Verificar variáveis de ambiente nas Edge Functions
- Verificar se API key está correta

### Embeddings não estão sendo gerados
- Verificar logs da Edge Function `generate-embeddings`
- Verificar se OpenAI API está acessível
- Verificar limites de rate da OpenAI API

### Busca não retorna resultados
- Verificar se processos foram ingeridos
- Verificar se embeddings foram gerados (não são NULL)
- Ajustar `match_threshold` (pode estar muito alto)
- Verificar se índice vetorial foi criado

## 📚 Referências

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Spec 005: `specs/005-base-conhecimento-processos/spec.md`
- Plano de Implementação: `specs/005-base-conhecimento-processos/IMPLEMENTATION_PLAN.md`
- Guia Rápido: `docs/README_BASE_CONHECIMENTO.md`

