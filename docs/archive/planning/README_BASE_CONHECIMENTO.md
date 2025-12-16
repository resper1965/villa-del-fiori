# Guia Rápido: Base de Conhecimento e RAG

## ✅ Implementação Concluída

A infraestrutura da Base de Conhecimento e RAG foi implementada. Segue o guia para configurar e usar.

## 🚀 Setup Rápido

### 1. Aplicar Migrations

Aplique as migrations SQL no Supabase Dashboard (SQL Editor) na ordem:

1. `supabase/migrations/013_add_pgvector_extension.sql`
2. `supabase/migrations/014_create_knowledge_base.sql`
3. `supabase/migrations/015_create_ingestion_trigger.sql`
4. `supabase/migrations/016_create_search_functions.sql`

### 2. Configurar Variáveis de Ambiente

No Supabase Dashboard → Edge Functions → Settings, adicione:

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

### 4. Ingerir Processos Existentes

```bash
# Configurar variáveis de ambiente
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sua-service-key"

# Executar script
npx tsx scripts/ingest_existing_processes.ts
```

### 5. Criar Índice Vetorial

Após ingerir processos, execute no SQL Editor:

```sql
CREATE INDEX idx_kb_docs_embedding 
ON knowledge_base_documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

## 📝 Como Funciona

### Ingestão Automática

Quando um processo é aprovado:
1. Trigger marca para ingestão
2. Edge Function `ingest-process` é chamada
3. Processo é dividido em chunks
4. Embeddings são gerados para cada chunk
5. Chunks são salvos na base de conhecimento

### Chat com RAG

Quando usuário envia mensagem:
1. Embedding da mensagem é gerado
2. Busca semântica encontra processos relevantes
3. Contexto é preparado com processos encontrados
4. LLM gera resposta usando contexto
5. Resposta é retornada com fontes

## 🧪 Testar

### Via Frontend

1. Acesse `/chat`
2. Faça uma pergunta sobre processos
3. Chat deve responder baseado em processos aprovados

### Via API

```bash
curl -X POST https://<project>.supabase.co/functions/v1/chat-with-rag \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Como reservo a academia?"}'
```

## 📚 Documentação Completa

- **Guia de Implementação**: `docs/IMPLEMENTACAO_BASE_CONHECIMENTO.md`
- **Plano de Implementação**: `specs/005-base-conhecimento-processos/IMPLEMENTATION_PLAN.md`
- **Spec Completa**: `specs/005-base-conhecimento-processos/spec.md`

## ⚠️ Próximos Passos

1. ✅ Infraestrutura criada
2. ⚠️ Aplicar migrations no Supabase
3. ⚠️ Configurar variáveis de ambiente
4. ⚠️ Deploy Edge Functions
5. ⚠️ Ingerir processos existentes
6. ⚠️ Testar chat

