# Feature Specification: Base de Conhecimento de Processos Aprovados

**Feature Branch**: `005-base-conhecimento-processos`  
**Created**: 2024-12-08  
**Status**: Draft  
**Input**: User description: "Fazer a ingestão de todos os processos aprovados para uma base de conhecimento, pode ser um RAG e outra forma simples para que sirva de KB"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ingestão Automática de Processos Aprovados (Priority: P1)

Sistema deve automaticamente ingerir processos quando são aprovados, extraindo conteúdo relevante e armazenando em formato otimizado para busca e recuperação.

**Why this priority**: Base de conhecimento só é útil se estiver atualizada. Ingestão automática garante que processos aprovados sejam imediatamente disponibilizados para consulta. Sem isso, base fica desatualizada.

**Independent Test**: Pode ser testado aprovando processo e verificando se conteúdo aparece na base de conhecimento. O valor entregue é base sempre atualizada.

**Acceptance Scenarios**:

1. **Given** que processo é aprovado, **When** status muda para "aprovado", **Then** sistema deve automaticamente iniciar processo de ingestão
2. **Given** que processo é ingerido, **When** conteúdo é processado, **Then** sistema deve extrair: nome, descrição, workflow, entidades, variáveis, diagrama Mermaid, RACI
3. **Given** que processo já existe na base, **When** nova versão é aprovada, **Then** sistema deve atualizar conteúdo existente mantendo histórico de versões
4. **Given** que processo é rejeitado após aprovação, **When** status muda, **Then** sistema deve marcar conteúdo como inativo na base (não deletar)

---

### User Story 2 - Busca Semântica na Base de Conhecimento (Priority: P1)

Usuários devem poder buscar processos na base de conhecimento usando linguagem natural, com sistema retornando resultados relevantes mesmo sem correspondência exata de palavras.

**Why this priority**: Busca semântica é essencial para que moradores encontrem informações mesmo sem conhecer terminologia exata. Melhora significativamente usabilidade.

**Independent Test**: Pode ser testado fazendo buscas com diferentes termos e verificando se resultados são relevantes. O valor entregue é descoberta fácil de informações.

**Acceptance Scenarios**:

1. **Given** que usuário busca "como reservar academia", **When** sistema processa busca, **Then** deve retornar processo de "Academia" e "Reservas de Áreas" mesmo sem palavras exatas
2. **Given** que usuário busca "emergência incêndio", **When** sistema processa, **Then** deve retornar processo de "Incêndio" com destaque para informações de emergência
3. **Given** que busca retorna múltiplos resultados, **When** usuário visualiza, **Then** deve ver ranking por relevância com snippets destacando termos buscados
4. **Given** que busca não encontra resultados, **When** sistema processa, **Then** deve sugerir termos relacionados e processos similares

---

### User Story 3 - Interface de Consulta à Base de Conhecimento (Priority: P1)

Interface simples e intuitiva para que moradores consultem processos aprovados, com busca, filtros e visualização de conteúdo completo.

**Why this priority**: Interface é necessária para que base de conhecimento seja acessível. Sem interface adequada, base não é utilizável.

**Independent Test**: Pode ser testado acessando interface, fazendo buscas e verificando se conteúdo é exibido corretamente. O valor entregue é acesso fácil a informações.

**Acceptance Scenarios**:

1. **Given** que morador acessa base de conhecimento, **When** visualiza interface, **Then** deve ver barra de busca, categorias e lista de processos aprovados
2. **Given** que morador busca processo, **When** resultados aparecem, **Then** deve ver cards com nome, categoria, descrição resumida e link para detalhes
3. **Given** que morador clica em processo, **When** visualiza detalhes, **Then** deve ver conteúdo completo: workflow, entidades, variáveis aplicadas, diagrama Mermaid
4. **Given** que morador quer filtrar por categoria, **When** seleciona filtro, **Then** lista deve atualizar mostrando apenas processos da categoria

---

### User Story 4 - Implementação RAG (Retrieval-Augmented Generation) (Priority: P2)

Sistema deve implementar RAG para permitir que chatbot ou assistente responda perguntas baseado no conteúdo dos processos aprovados.

**Why this priority**: RAG permite respostas precisas baseadas em documentos reais, melhorando qualidade de respostas do chatbot. Importante para funcionalidade de chatbot inteligente.

**Independent Test**: Pode ser testado fazendo perguntas ao sistema RAG e verificando se respostas são baseadas em processos corretos. O valor entregue é respostas precisas e contextualizadas.

**Acceptance Scenarios**:

1. **Given** que sistema RAG recebe pergunta, **When** processa, **Then** deve buscar processos relevantes na base de conhecimento
2. **Given** que processos relevantes são encontrados, **When** RAG gera resposta, **Then** deve usar conteúdo dos processos como contexto
3. **Given** que resposta é gerada, **When** exibida, **Then** deve incluir referências aos processos usados como fonte
4. **Given** que pergunta não tem resposta nos processos, **When** RAG processa, **Then** deve indicar que informação não está disponível na base

---

### User Story 5 - Formato Alternativo Simples (Priority: P2)

Além de RAG, sistema deve oferecer formato simples de base de conhecimento (ex: JSON estruturado, markdown indexado) para casos de uso mais simples.

**Why this priority**: Nem todos os casos de uso precisam de RAG. Formato simples é mais fácil de manter, mais rápido e suficiente para buscas básicas.

**Independent Test**: Pode ser testado exportando base em formato simples e verificando se estrutura é clara e acessível. O valor entregue é flexibilidade e simplicidade.

**Acceptance Scenarios**:

1. **Given** que administrador exporta base de conhecimento, **When** seleciona formato simples, **Then** deve gerar arquivo JSON ou Markdown com todos os processos
2. **Given** que base está em formato simples, **When** sistema busca, **Then** deve usar busca textual otimizada (full-text search)
3. **Given** que formato simples é usado, **When** conteúdo é atualizado, **Then** deve ser mais rápido que RAG para atualizações
4. **Given** que ambos formatos existem, **When** sistema processa busca, **Then** deve poder escolher formato baseado em complexidade da query

---

## Technical Requirements

### Arquitetura de Base de Conhecimento

**Opção 1: RAG (Recomendado para chatbot)**
- Vector database (ex: Pinecone, Weaviate, ou pgvector)
- Embeddings model (ex: OpenAI embeddings, ou modelo open-source)
- Pipeline de chunking e indexação
- Retrieval system com similarity search
- Generation com LLM (ex: GPT-4, Claude, ou modelo local)

**Opção 2: Formato Simples**
- Full-text search engine (ex: Elasticsearch, Meilisearch, ou PostgreSQL full-text)
- Estrutura JSON/Markdown indexada
- Busca por palavras-chave e categorias
- Ranking por relevância simples

**Opção 3: Híbrido (Recomendado)**
- Formato simples para buscas rápidas e filtros
- RAG para respostas complexas e chatbot
- Sincronização entre ambos

### Backend

- Service de ingestão automática de processos aprovados
- Pipeline de processamento e indexação
- API de busca semântica
- API de busca simples (full-text)
- Endpoint para exportação de base de conhecimento
- Sistema de versionamento de conteúdo

### Frontend

- Interface de busca e consulta
- Visualização de resultados com snippets
- Filtros por categoria e tipo
- Página de detalhes do processo
- Integração com chatbot (quando implementado)

### Database/Storage

- Tabela de documentos indexados
- Vector embeddings (se RAG)
- Índices para busca rápida
- Cache de buscas frequentes

---

## Non-Functional Requirements

- **Performance**: Busca deve retornar resultados em < 1s
- **Escalabilidade**: Sistema deve suportar 1000+ processos indexados
- **Atualização**: Ingestão de novo processo deve completar em < 5s
- **Precisão**: Busca semântica deve ter recall > 80% para queries relevantes
- **Disponibilidade**: Base de conhecimento deve estar sempre disponível (99.9% uptime)

---

## Dependencies

- Sistema de processos (já existe)
- Sistema de aprovação (já existe)
- LLM API (para RAG) - opcional
- Vector database (para RAG) - opcional

---

## Open Questions

1. Qual modelo de embeddings usar? (OpenAI, open-source, ou modelo local?)
2. Qual vector database usar? (Pinecone, Weaviate, pgvector, ou outro?)
3. Deve haver re-indexação periódica ou apenas incremental?
4. Qual tamanho de chunks para RAG? (parágrafos, seções, processos completos?)
5. Deve haver cache de embeddings ou recalcular sempre?

