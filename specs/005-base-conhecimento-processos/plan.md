# Technical Plan: Base de Conhecimento de Processos Aprovados

**Feature**: 005-base-conhecimento-processos  
**Status**: Planning  
**Created**: 2024-12-08

## Overview

Sistema de base de conhecimento que ingere processos aprovados e permite busca semântica e simples para consulta por moradores e uso em chatbot.

## Architecture

### Opção 1: RAG (Retrieval-Augmented Generation)

**Componentes:**
- **Vector Database**: Pinecone, Weaviate, ou pgvector (PostgreSQL)
- **Embeddings Model**: OpenAI text-embedding-ada-002 ou modelo open-source (sentence-transformers)
- **Chunking Strategy**: Por seção do processo (workflow, descrição, etc.)
- **Retrieval**: Similarity search com top-k (k=5)
- **Generation**: LLM (GPT-4, Claude, ou modelo local)

**Pipeline:**
1. Processo aprovado → Trigger de ingestão
2. Extração de conteúdo → Chunking
3. Geração de embeddings → Indexação em vector DB
4. Busca semântica → Retrieval de chunks relevantes
5. Geração de resposta → LLM com contexto

### Opção 2: Formato Simples

**Componentes:**
- **Search Engine**: PostgreSQL full-text search, Elasticsearch, ou Meilisearch
- **Indexação**: Por processo completo e por seções
- **Busca**: Full-text search com ranking por relevância
- **Formato**: JSON estruturado ou Markdown indexado

**Pipeline:**
1. Processo aprovado → Trigger de ingestão
2. Extração de conteúdo → Estruturação
3. Indexação → Full-text search index
4. Busca → Query processing e ranking
5. Resultados → Formatação e exibição

### Opção 3: Híbrido (Recomendado)

**Componentes:**
- Formato simples para buscas rápidas e filtros
- RAG para respostas complexas e chatbot
- Sincronização automática entre ambos

## Technology Stack

**RAG:**
- Vector DB: pgvector (PostgreSQL) ou Pinecone
- Embeddings: OpenAI API ou sentence-transformers (local)
- LLM: OpenAI GPT-4, Anthropic Claude, ou Ollama (local)

**Formato Simples:**
- Search: PostgreSQL full-text search ou Meilisearch
- Indexação: PostgreSQL GIN indexes

**Backend:**
- Supabase Edge Functions (Deno/TypeScript)
- Background jobs: Edge Functions assíncronas

**Frontend:**
- Next.js 14, React, TypeScript
- Componentes de busca e resultados

## Implementation Phases

### Phase 1: Ingestão Básica (MVP)
- Trigger automático quando processo é aprovado
- Extração de conteúdo (nome, descrição, workflow, etc.)
- Armazenamento em formato simples (JSON)
- Busca básica full-text

### Phase 2: Busca Semântica
- Implementação de RAG
- Vector database setup
- Embeddings generation
- Similarity search

### Phase 3: Interface e Otimizações
- Interface de busca
- Filtros e categorias
- Otimizações de performance
- Cache de buscas frequentes

## Database Schema

**Tabela de Documentos:**
```sql
CREATE TABLE knowledge_base_documents (
    id UUID PRIMARY KEY,
    process_id UUID REFERENCES processes(id),
    title TEXT,
    content TEXT,
    category TEXT,
    entities TEXT[],
    variables TEXT[],
    workflow TEXT[],
    mermaid_diagram TEXT,
    raci JSONB,
    status TEXT, -- 'active', 'inactive'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Full-text search index
CREATE INDEX idx_kb_documents_fts ON knowledge_base_documents 
USING gin(to_tsvector('portuguese', title || ' ' || content));
```

**Tabela de Embeddings (se RAG):**
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_base_embeddings (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES knowledge_base_documents(id),
    chunk_text TEXT,
    embedding vector(1536), -- OpenAI ada-002 dimension
    chunk_index INTEGER,
    created_at TIMESTAMP
);

-- Vector similarity index
CREATE INDEX idx_kb_embeddings_vector ON knowledge_base_embeddings 
USING ivfflat (embedding vector_cosine_ops);
```

## API Contracts

### POST /api/v1/knowledge/ingest

**Request:**
```json
{
  "process_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "document_id": "uuid",
  "chunks_created": 5
}
```

### GET /api/v1/knowledge/search

**Request:**
```json
{
  "query": "Como reservo a academia?",
  "type": "semantic", // ou "simple"
  "limit": 10,
  "category": "Áreas Comuns" // opcional
}
```

**Response:**
```json
{
  "results": [
    {
      "document_id": "uuid",
      "process_id": "uuid",
      "title": "Academia",
      "snippet": "...",
      "relevance_score": 0.95,
      "category": "Áreas Comuns"
    }
  ],
  "total": 5
}
```

### GET /api/v1/knowledge/rag

**Request:**
```json
{
  "query": "Como reservo a academia?",
  "context_limit": 5
}
```

**Response:**
```json
{
  "answer": "Para reservar a academia...",
  "sources": [
    {
      "process_id": "uuid",
      "title": "Academia",
      "relevance": 0.95
    }
  ],
  "context_used": ["chunk1", "chunk2"]
}
```

## Chunking Strategy

**Para RAG:**
- Chunk por seção: descrição, workflow (cada etapa), entidades, variáveis
- Tamanho: ~500 tokens por chunk
- Overlap: 50 tokens entre chunks
- Metadata: processo_id, seção, tipo

## Performance Considerations

- Cache de embeddings (não recalcular se processo não mudou)
- Cache de buscas frequentes (Redis)
- Background processing para ingestão
- Batch processing para re-indexação
- Limite de chunks por processo (máx 20)

## Cost Estimation (RAG)

**OpenAI Embeddings:**
- ~$0.0001 por 1K tokens
- Processo médio: ~2K tokens = $0.0002
- 35 processos: ~$0.007 (ingestão inicial)
- Busca: ~$0.0001 por query

**OpenAI GPT-4:**
- ~$0.03 por 1K tokens (input)
- Resposta média: ~500 tokens = $0.015
- 100 queries/dia: ~$1.50/dia

**Alternativa Local (Ollama):**
- Sem custo de API
- Requer servidor com GPU
- Latência maior

## Testing Strategy

- Unit tests para chunking e extração
- Integration tests para ingestão
- E2E tests para busca
- Performance tests para RAG
- Accuracy tests para similarity search

