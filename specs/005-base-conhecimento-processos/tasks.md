# Tasks: Base de Conhecimento de Processos Aprovados

**Input**: Design documents from `/specs/005-base-conhecimento-processos/`
**Prerequisites**: plan.md ✓, spec.md ✓

**Organization**: Tasks are grouped by implementation phase.

## Format: `[ID] [P?] [Phase] Description`

- **[P]**: Can run in parallel
- **[Phase]**: Implementation phase (P1, P2, P3)

## Phase 1: Ingestão Básica (MVP)

**Purpose**: Ingestão automática de processos aprovados em formato simples

- [ ] T001 [P1] Create KnowledgeBaseDocument model in backend/src/app/models/knowledge_base.py
- [ ] T002 [P1] Create database migration for knowledge_base_documents table
- [ ] T003 [P1] Create KnowledgeBaseService in backend/src/app/services/knowledge_base_service.py
- [ ] T004 [P1] Implement extract_process_content() method
- [ ] T005 [P1] Implement ingest_process() method
- [ ] T006 [P1] Create trigger/hook when process status changes to "aprovado"
- [ ] T007 [P1] Create POST /api/v1/knowledge/ingest endpoint
- [ ] T008 [P1] Implement full-text search index (PostgreSQL GIN)
- [ ] T009 [P1] Create GET /api/v1/knowledge/search endpoint (simple search)
- [ ] T010 [P1] Implement search ranking by relevance
- [ ] T011 [P1] Write unit tests for ingestion
- [ ] T012 [P1] Write integration tests for search

## Phase 2: Interface de Busca (MVP)

**Purpose**: Interface para que usuários busquem na base de conhecimento

- [ ] T013 [P] [P1] Create KnowledgeSearch component in frontend/src/components/knowledge/KnowledgeSearch.tsx
- [ ] T014 [P1] Create KnowledgeResults component in frontend/src/components/knowledge/KnowledgeResults.tsx
- [ ] T015 [P1] Create KnowledgeCard component in frontend/src/components/knowledge/KnowledgeCard.tsx
- [ ] T016 [P1] Create knowledge base page in frontend/src/app/(dashboard)/knowledge/page.tsx
- [ ] T017 [P1] Implement search input with debounce
- [ ] T018 [P1] Add category filters
- [ ] T019 [P1] Implement result highlighting (snippets)
- [ ] T020 [P1] Create API client functions in frontend/src/lib/api/knowledge.ts
- [ ] T021 [P1] Create useKnowledgeSearch hook in frontend/src/lib/hooks/useKnowledgeSearch.ts
- [ ] T022 [P1] Write E2E tests for search interface

## Phase 3: RAG Implementation (Phase 2)

**Purpose**: Implementar RAG para busca semântica

- [ ] T023 [P2] Setup vector database (pgvector extension ou Pinecone)
- [ ] T024 [P2] Create KnowledgeBaseEmbedding model in backend/src/app/models/knowledge_base.py
- [ ] T025 [P2] Create database migration for embeddings table
- [ ] T026 [P2] Implement chunking strategy in KnowledgeBaseService
- [ ] T027 [P2] Integrate embeddings API (OpenAI ou sentence-transformers)
- [ ] T028 [P2] Implement generate_embeddings() method
- [ ] T029 [P2] Implement index_embeddings() method
- [ ] T030 [P2] Implement similarity_search() method
- [ ] T031 [P2] Create GET /api/v1/knowledge/search endpoint (semantic search)
- [ ] T032 [P2] Update ingestion to generate embeddings
- [ ] T033 [P2] Write tests for RAG pipeline

## Phase 4: RAG API (Phase 2)

**Purpose**: API para usar RAG em chatbot

- [ ] T034 [P2] Create RAGService in backend/src/app/services/rag_service.py
- [ ] T035 [P2] Implement retrieve_context() method
- [ ] T036 [P2] Integrate LLM API (OpenAI, Claude, ou Ollama)
- [ ] T037 [P2] Implement generate_answer() method with context
- [ ] T038 [P2] Create GET /api/v1/knowledge/rag endpoint
- [ ] T039 [P2] Implement source citation extraction
- [ ] T040 [P2] Add prompt engineering for consistent responses
- [ ] T041 [P2] Write tests for RAG API

## Phase 5: Otimizações e Cache (Phase 3)

**Purpose**: Otimizar performance e adicionar cache

- [ ] T042 [P] [P3] Implement embedding cache (não recalcular se processo não mudou)
- [ ] T043 [P3] Implement search result cache (Redis ou in-memory)
- [ ] T044 [P3] Add background job for re-indexing
- [ ] T045 [P3] Optimize similarity search queries
- [ ] T046 [P3] Add pagination to search results
- [ ] T047 [P3] Implement incremental updates (only changed processes)

## Phase 6: Exportação e Formato Alternativo (Phase 2)

**Purpose**: Exportar base de conhecimento em formato simples

- [ ] T048 [P2] Create export_knowledge_base() method (JSON format)
- [ ] T049 [P2] Create export_knowledge_base_markdown() method
- [ ] T050 [P2] Create GET /api/v1/knowledge/export endpoint
- [ ] T051 [P2] Add format options (JSON, Markdown, CSV)
- [ ] T052 [P2] Implement download functionality in frontend

## Phase 7: Monitoring & Analytics (Phase 3)

**Purpose**: Monitorar uso e performance da base de conhecimento

- [ ] T053 [P] [P3] Add search analytics (queries, results, clicks)
- [ ] T054 [P3] Create analytics dashboard
- [ ] T055 [P3] Add monitoring for ingestion failures
- [ ] T056 [P3] Implement alerting for system issues

## Phase 8: Testing & Documentation

**Purpose**: Testes completos e documentação

- [ ] T057 [P] Write comprehensive unit tests
- [ ] T058 [P] Write integration tests for RAG
- [ ] T059 [P] Write performance tests
- [ ] T060 [P] Test accuracy of semantic search
- [ ] T061 [P] Update API documentation
- [ ] T062 [P] Create admin guide for knowledge base management

