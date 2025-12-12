# Plano de Implementação: Base de Conhecimento de Processos (Spec 005)

**Criado**: 2025-01-09  
**Status**: 📋 Planejamento  
**Prioridade**: P0 - Crítico

## 🎯 Objetivo

Implementar base de conhecimento para ingestão automática de processos aprovados e sistema RAG (Retrieval-Augmented Generation) para busca semântica, permitindo que o chat responda perguntas baseado em processos aprovados.

## 📋 Visão Geral da Implementação

### Arquitetura Proposta

```
┌─────────────────┐
│  Processo       │
│  Aprovado       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pipeline de    │
│  Ingestão       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Chunking &     │─────▶│  Embeddings  │
│  Processamento  │      │  Model       │
└────────┬────────┘      └──────┬───────┘
         │                      │
         ▼                      ▼
┌─────────────────┐      ┌──────────────┐
│  Vector         │◀─────│  Vector      │
│  Database       │      │  Storage     │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  RAG System     │
│  (Retrieval)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chat API       │
└─────────────────┘
```

## 🔧 Decisões Técnicas

### 1. Vector Database

**Opções**:
- **pgvector** (PostgreSQL extension) - ✅ Recomendado
  - Prós: Integrado com Supabase, sem serviço externo, gratuito
  - Contras: Pode ser mais lento que soluções especializadas
- **Pinecone** - Alternativa
  - Prós: Muito rápido, gerenciado, escalável
  - Contras: Serviço pago, dependência externa
- **Weaviate** - Alternativa
  - Prós: Open-source, auto-hospedado
  - Contras: Requer infraestrutura própria

**Decisão**: **pgvector** (integração com Supabase)

### 2. Embeddings Model

**Opções**:
- **OpenAI text-embedding-3-small** - ✅ Recomendado
  - Prós: Boa qualidade, API estável, suporte a português
  - Contras: Custo por requisição, dependência externa
- **text-embedding-3-large** - Alternativa
  - Prós: Melhor qualidade
  - Contras: Mais caro
- **Modelos open-source** (sentence-transformers) - Alternativa
  - Prós: Gratuito, sem dependência externa
  - Contras: Requer infraestrutura, pode ter qualidade inferior

**Decisão**: **OpenAI text-embedding-3-small** (MVP), considerar open-source depois

### 3. Chunking Strategy

**Estratégia**: Chunking por seções do processo
- Cada processo será dividido em chunks lógicos:
  - Nome e descrição
  - Workflow (cada etapa)
  - Entidades envolvidas
  - Variáveis aplicadas
  - Matriz RACI

**Tamanho de chunk**: ~500 tokens (ajustável)

### 4. Storage

**Estrutura no Supabase**:
```sql
-- Tabela de documentos indexados
CREATE TABLE knowledge_base_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES processes(id),
  process_version_id UUID REFERENCES process_versions(id),
  chunk_index INTEGER,
  content TEXT,
  metadata JSONB,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca vetorial
CREATE INDEX ON knowledge_base_documents 
USING ivfflat (embedding vector_cosine_ops);
```

## 📝 Plano de Implementação

### Fase 1: Setup e Infraestrutura (Semana 1)

**Tarefas**:
- [ ] Instalar extensão pgvector no Supabase
- [ ] Criar tabela `knowledge_base_documents`
- [ ] Criar índices para busca vetorial
- [ ] Configurar variáveis de ambiente (OpenAI API key)
- [ ] Criar Edge Function para embeddings

**Arquivos**:
- `supabase/migrations/013_add_pgvector_extension.sql`
- `supabase/migrations/014_create_knowledge_base.sql`
- `supabase/functions/generate-embeddings/index.ts`

### Fase 2: Pipeline de Ingestão (Semana 1-2)

**Tarefas**:
- [ ] Criar função de chunking de processos
- [ ] Implementar geração de embeddings
- [ ] Criar trigger para ingestão automática quando processo é aprovado
- [ ] Implementar re-indexação quando processo é atualizado
- [ ] Criar script de ingestão em lote para processos existentes

**Arquivos**:
- `supabase/functions/ingest-process/index.ts`
- `supabase/migrations/015_create_ingestion_trigger.sql`
- `scripts/ingest_existing_processes.ts`

### Fase 3: Sistema de Busca (Semana 2)

**Tarefas**:
- [ ] Implementar busca vetorial (similarity search)
- [ ] Criar função de ranking por relevância
- [ ] Implementar filtros (por categoria, status, etc.)
- [ ] Criar API endpoint para busca
- [ ] Adicionar cache de buscas frequentes

**Arquivos**:
- `supabase/functions/search-knowledge/index.ts`
- `supabase/migrations/016_create_search_functions.sql`

### Fase 4: Integração com Chat (Semana 2-3)

**Tarefas**:
- [ ] Integrar busca RAG no chat
- [ ] Implementar preparação de contexto para LLM
- [ ] Adicionar citações de processos nas respostas
- [ ] Implementar fallback quando não há resultados
- [ ] Testes end-to-end

**Arquivos**:
- `supabase/functions/chat-with-rag/index.ts`
- `frontend/src/lib/api/chat.ts` (atualizar)

### Fase 5: Testes e Validação (Semana 3)

**Tarefas**:
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Validação de qualidade das respostas
- [ ] Testes de performance
- [ ] Ajustes finais

## 🔐 Variáveis de Ambiente

```env
# OpenAI API
OPENAI_API_KEY=sk-...

# Embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# Vector Database
VECTOR_DB_TYPE=pgvector
```

## 📊 Métricas de Sucesso

- ✅ 100% dos processos aprovados são ingeridos automaticamente
- ✅ Busca semântica retorna resultados relevantes em < 1s
- ✅ Recall > 80% para queries relevantes
- ✅ Ingestão de novo processo completa em < 5s
- ✅ Sistema suporta 1000+ processos indexados

## 🧪 Testes

### Testes Unitários
- Chunking de processos
- Geração de embeddings
- Busca vetorial

### Testes de Integração
- Pipeline completo de ingestão
- Busca e ranking
- Integração com chat

### Testes de Performance
- Tempo de ingestão
- Tempo de busca
- Escalabilidade

## 🚀 Deploy

### Supabase
1. Aplicar migrations em ordem
2. Deploy Edge Functions
3. Configurar variáveis de ambiente
4. Executar script de ingestão em lote

### Frontend
1. Atualizar API client
2. Integrar com chat
3. Deploy na Vercel

## 📚 Referências

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Spec 005: `specs/005-base-conhecimento-processos/spec.md`

## 🔄 Próximos Passos

1. Revisar e aprovar este plano
2. Configurar pgvector no Supabase
3. Começar Fase 1 (Setup e Infraestrutura)





