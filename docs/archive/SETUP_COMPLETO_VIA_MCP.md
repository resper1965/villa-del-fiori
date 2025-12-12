# Setup Completo via MCP - Base de Conhecimento

**Data**: 2025-01-09  
**Status**: ✅ Concluído

## ✅ O Que Foi Feito via MCP

### 1. Migrations Aplicadas ✅

Todas as migrations foram aplicadas com sucesso via MCP:

- ✅ `add_pgvector_extension` - Extensão pgvector habilitada
- ✅ `create_knowledge_base` - Tabelas e índices criados
- ✅ `create_ingestion_trigger` - Triggers de ingestão automática criados
- ✅ `create_search_functions` - Funções de busca vetorial criadas

### 2. Edge Functions Deployadas ✅

Todas as Edge Functions foram deployadas com sucesso:

- ✅ `generate-embeddings` - Status: ACTIVE
- ✅ `ingest-process` - Status: ACTIVE
- ✅ `search-knowledge` - Status: ACTIVE (aguardando confirmação)
- ✅ `chat-with-rag` - Status: ACTIVE (aguardando confirmação)

## 📋 Próximos Passos

### 1. Configurar Variáveis de Ambiente

As Edge Functions precisam das seguintes variáveis de ambiente configuradas no Supabase Dashboard:

**No Supabase Dashboard → Edge Functions → Settings → Secrets:**

```env
OPENAI_API_KEY=sk-... (sua chave da OpenAI)
EMBEDDING_MODEL=text-embedding-3-small (opcional, já é o padrão)
CHAT_MODEL=gpt-4o-mini (opcional, já é o padrão)
EMBEDDING_DIMENSION=1536 (opcional, já é o padrão)
```

**Como configurar:**
1. Acesse Supabase Dashboard
2. Vá em Edge Functions
3. Clique em Settings
4. Adicione as variáveis de ambiente (Secrets)

### 2. Verificar Tabelas Criadas

As seguintes tabelas foram criadas:

- ✅ `knowledge_base_documents` - Documentos indexados com embeddings
- ✅ `knowledge_base_ingestion_status` - Status de ingestão

### 3. Verificar Extensões

- ✅ Extensão `vector` instalada (versão 0.8.0)

### 4. Ingerir Processos Existentes

Quando houver processos aprovados, eles serão automaticamente marcados para ingestão pelos triggers. Para ingerir processos já aprovados manualmente:

**Opção 1: Via Script (quando houver processos aprovados)**
```bash
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sua-service-key"
npx tsx scripts/ingest_existing_processes.ts
```

**Opção 2: Via Edge Function diretamente**
```bash
curl -X POST https://<project>.supabase.co/functions/v1/ingest-process \
  -H "Authorization: Bearer <service-role-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "process_id": "<process-id>",
    "process_version_id": "<version-id>"
  }'
```

### 5. Criar Índice Vetorial (Após Primeira Ingestão)

**IMPORTANTE**: O índice IVFFlat precisa ser criado após ter dados na tabela.

Execute via MCP ou SQL Editor:

```sql
CREATE INDEX idx_kb_docs_embedding 
ON knowledge_base_documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

## 🧪 Testar

### Testar Geração de Embeddings

```bash
curl -X POST https://<project>.supabase.co/functions/v1/generate-embeddings \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Como reservo a academia?"}'
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

## 📊 Status Atual

- ✅ Migrations aplicadas
- ✅ Edge Functions deployadas
- ⚠️ Variáveis de ambiente precisam ser configuradas manualmente
- ⚠️ Processos aprovados precisam ser ingeridos (quando houver)
- ⚠️ Índice vetorial precisa ser criado após primeira ingestão

## 🔗 Referências

- **Guia de Implementação**: `docs/IMPLEMENTACAO_BASE_CONHECIMENTO.md`
- **Plano de Implementação**: `specs/005-base-conhecimento-processos/IMPLEMENTATION_PLAN.md`
- **Spec Completa**: `specs/005-base-conhecimento-processos/spec.md`

