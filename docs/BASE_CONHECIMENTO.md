# Base de Conhecimento - Como Funciona

**Data**: 2025-01-15  
**Sistema**: Gabi - Síndica Virtual

---

## 📚 Visão Geral

A Base de Conhecimento é o sistema que permite ao **Chat com Gabi** responder perguntas sobre processos e informações do condomínio. Ela utiliza tecnologia **RAG (Retrieval-Augmented Generation)** para buscar informações relevantes e gerar respostas contextuais.

---

## 🔄 Fluxo de Funcionamento

### 1. **Ingestão de Processos**

Quando um processo é **aprovado**, ele é automaticamente indexado na base de conhecimento:

1. **Processo Aprovado** → O sistema detecta que um processo mudou para status `aprovado`
2. **Divisão em Chunks** → O conteúdo do processo é dividido em pedaços menores (chunks)
3. **Geração de Embeddings** → Cada chunk é convertido em um vetor numérico (embedding) usando OpenAI
4. **Armazenamento** → Os chunks e embeddings são salvos na tabela `knowledge_base_documents`

### 2. **Estrutura dos Chunks**

Cada processo é dividido em diferentes tipos de chunks:

- **`name`**: Nome do processo
- **`description`**: Descrição do processo
- **`workflow`**: Fluxo de trabalho/passos
- **`entities`**: Entidades envolvidas (síndico, fornecedores, etc.)
- **`variables`**: Variáveis do processo
- **`raci`**: Matriz RACI (Responsável, Aprovador, Consultado, Informado)
- **`content`**: Conteúdo geral do processo

### 3. **Busca Semântica (RAG)**

Quando um usuário faz uma pergunta no chat:

1. **Pergunta do Usuário** → "Como funciona o processo de aprovação de obras?"
2. **Geração de Embedding da Pergunta** → A pergunta é convertida em um vetor
3. **Busca Vetorial** → O sistema busca os chunks mais similares usando distância vetorial (cosine similarity)
4. **Recuperação de Contexto** → Os chunks mais relevantes são recuperados
5. **Geração de Resposta** → O LLM (Large Language Model) gera uma resposta baseada nos chunks encontrados
6. **Resposta ao Usuário** → A resposta é exibida com referências aos processos encontrados

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `knowledge_base_documents`

Armazena os documentos indexados com seus embeddings:

```sql
CREATE TABLE knowledge_base_documents (
    id UUID PRIMARY KEY,
    process_id UUID,                    -- ID do processo relacionado
    process_version_id UUID,            -- ID da versão específica
    chunk_index INTEGER,                -- Índice sequencial do chunk
    chunk_type VARCHAR,                 -- Tipo: name, description, workflow, etc.
    content TEXT,                       -- Texto do chunk
    metadata JSONB,                     -- Metadados adicionais
    embedding VECTOR(1536),             -- Embedding vetorial (OpenAI text-embedding-3-small)
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Campos Importantes**:
- **`embedding`**: Vetor de 1536 dimensões gerado pela OpenAI
- **`chunk_type`**: Tipo do chunk (name, description, workflow, etc.)
- **`content`**: Texto que será usado para busca e exibição
- **`metadata`**: Informações adicionais em JSON (categoria, tipo de documento, etc.)

### Tabela: `knowledge_base_ingestion_status`

Rastreia o status de ingestão de cada processo:

```sql
CREATE TABLE knowledge_base_ingestion_status (
    id UUID PRIMARY KEY,
    process_id UUID,
    process_version_id UUID,
    status VARCHAR,                     -- pending, processing, completed, failed
    error_message TEXT,
    chunks_count INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Status Possíveis**:
- **`pending`**: Aguardando processamento
- **`processing`**: Em processamento
- **`completed`**: Processamento concluído
- **`failed`**: Falha no processamento

---

## 🔍 Busca Vetorial

### Como Funciona

1. **Embedding da Pergunta**: A pergunta do usuário é convertida em um vetor usando o mesmo modelo (OpenAI text-embedding-3-small)

2. **Busca por Similaridade**: O sistema usa **cosine similarity** para encontrar os chunks mais similares:
   ```sql
   SELECT * FROM knowledge_base_documents
   WHERE embedding <=> query_embedding < threshold
   ORDER BY embedding <=> query_embedding
   LIMIT match_count;
   ```

3. **Threshold de Similaridade**: Apenas chunks com similaridade acima de um threshold são retornados (ex: 0.7)

4. **Limite de Resultados**: Um número limitado de chunks é retornado (ex: 5-10 chunks)

### Índices de Performance

- **Índice Vetorial**: `pgvector` é usado para busca eficiente de embeddings
- **Índice Full-Text Search**: Busca textual tradicional também disponível
- **Índices de Metadados**: Índices GIN para busca em campos JSONB

---

## 🔐 Segurança (RLS)

### Políticas de Acesso

1. **Visualização**: Apenas usuários autenticados podem visualizar documentos de processos **aprovados**
   ```sql
   -- Usuários autenticados podem ver documentos de processos aprovados
   CREATE POLICY "Authenticated users can view knowledge base documents"
   ON knowledge_base_documents
   FOR SELECT
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM processes p
       JOIN process_versions pv ON pv.process_id = p.id
       WHERE pv.id = knowledge_base_documents.process_version_id
       AND p.status = 'aprovado'
     )
   );
   ```

2. **Inserção/Atualização**: Apenas o **service role** (via Edge Functions) pode inserir/atualizar documentos

### Proteções

- ✅ Processos em rascunho ou rejeitados **não aparecem** na base de conhecimento
- ✅ Apenas processos **aprovados** são indexados
- ✅ Usuários só veem documentos de processos que têm permissão de visualizar

---

## 📊 Processo de Ingestão

### Fluxo Automático

1. **Trigger de Aprovação**: Quando um processo é aprovado, um trigger ou função detecta a mudança
2. **Criação de Status**: Um registro é criado em `knowledge_base_ingestion_status` com status `pending`
3. **Processamento**: Uma Edge Function ou job processa o processo:
   - Divide o conteúdo em chunks
   - Gera embeddings para cada chunk
   - Salva na tabela `knowledge_base_documents`
4. **Atualização de Status**: O status é atualizado para `completed` ou `failed`

### Chunks Gerados

Para cada processo aprovado, são gerados múltiplos chunks:

- **1 chunk** do tipo `name` (nome do processo)
- **1 chunk** do tipo `description` (descrição)
- **N chunks** do tipo `workflow` (um por passo do workflow)
- **1 chunk** do tipo `entities` (entidades envolvidas)
- **1 chunk** do tipo `variables` (variáveis)
- **1 chunk** do tipo `raci` (matriz RACI)
- **N chunks** do tipo `content` (conteúdo geral, dividido em pedaços)

---

## 💬 Integração com o Chat

### Como o Chat Usa a Base de Conhecimento

1. **Pergunta do Usuário**: "Como funciona o processo de aprovação de obras?"

2. **Busca na Base**: O sistema busca chunks relevantes usando embeddings

3. **Contexto Recuperado**: Chunks encontrados são passados como contexto para o LLM

4. **Geração de Resposta**: O LLM gera uma resposta baseada no contexto:
   - Resposta natural e fluida
   - Referências aos processos encontrados
   - Informações precisas e atualizadas

5. **Exibição**: A resposta é exibida com:
   - Texto da resposta
   - Referências aos processos (links, nomes)
   - Fontes dos chunks utilizados

---

## 🛠️ Funções de Busca

### Função: `match_knowledge_base_documents`

Busca documentos similares a uma query:

```sql
SELECT * FROM match_knowledge_base_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
);
```

**Parâmetros**:
- `query_embedding`: Embedding da pergunta do usuário
- `match_threshold`: Threshold de similaridade (0.0 a 1.0)
- `match_count`: Número máximo de resultados

**Retorna**: Chunks mais similares com suas informações

---

## 📈 Monitoramento

### Status de Ingestão

Você pode verificar o status de ingestão de processos:

```sql
SELECT 
  p.name as process_name,
  pv.version_number,
  ibs.status,
  ibs.chunks_count,
  ibs.error_message,
  ibs.completed_at
FROM knowledge_base_ingestion_status ibs
JOIN processes p ON p.id = ibs.process_id
JOIN process_versions pv ON pv.id = ibs.process_version_id
ORDER BY ibs.created_at DESC;
```

### Estatísticas

- **Total de documentos indexados**: `SELECT COUNT(*) FROM knowledge_base_documents;`
- **Documentos por tipo**: `SELECT chunk_type, COUNT(*) FROM knowledge_base_documents GROUP BY chunk_type;`
- **Processos indexados**: `SELECT COUNT(DISTINCT process_id) FROM knowledge_base_documents;`

---

## 🔄 Atualização Automática

### Quando um Processo é Atualizado

1. **Nova Versão Aprovada**: Quando uma nova versão é aprovada, os chunks antigos são mantidos (histórico)
2. **Novos Chunks**: Novos chunks são criados para a nova versão
3. **Busca Atualizada**: A busca sempre retorna a versão mais recente aprovada

### Limpeza (Opcional)

Chunks de versões antigas podem ser mantidos para histórico ou removidos:
- **Manter**: Permite buscar em versões antigas
- **Remover**: Mantém apenas a versão mais recente (economiza espaço)

---

## 🎯 Benefícios

### Para Usuários

- ✅ **Respostas Rápidas**: Encontra informações instantaneamente
- ✅ **Respostas Precisas**: Baseadas em processos aprovados e atualizados
- ✅ **Contexto Completo**: Inclui referências e fontes
- ✅ **Busca Natural**: Pode fazer perguntas em linguagem natural

### Para Administradores

- ✅ **Indexação Automática**: Processos são indexados automaticamente ao serem aprovados
- ✅ **Rastreabilidade**: Status de ingestão é rastreado
- ✅ **Segurança**: Apenas processos aprovados são indexados
- ✅ **Performance**: Busca vetorial é rápida e eficiente

---

## 📝 Notas Técnicas

### Modelo de Embedding

- **Modelo**: OpenAI `text-embedding-3-small`
- **Dimensões**: 1536
- **Custo**: Baixo (modelo otimizado)
- **Qualidade**: Alta (especializado em português)

### Extensão PostgreSQL

- **pgvector**: Extensão para busca vetorial
- **Índice HNSW**: Índice hierárquico para busca rápida
- **Cosine Similarity**: Métrica de similaridade usada

### Limites

- **Tamanho do Chunk**: ~500-1000 tokens (otimizado para contexto)
- **Número de Chunks**: Sem limite prático
- **Busca**: Retorna até 10-20 chunks mais relevantes

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Re-indexação Automática**: Re-indexar processos quando entidades são atualizadas
2. **Busca Híbrida**: Combinar busca vetorial com busca textual
3. **Cache de Embeddings**: Cachear embeddings de perguntas frequentes
4. **Análise de Uso**: Rastrear quais chunks são mais utilizados
5. **Feedback Loop**: Permitir feedback dos usuários para melhorar resultados

---

## 📚 Referências

- **Tabela**: `knowledge_base_documents`
- **Tabela**: `knowledge_base_ingestion_status`
- **Funções**: `match_knowledge_base_documents`, `get_relevant_chunks`
- **Extensão**: `pgvector` (PostgreSQL)
- **Modelo**: OpenAI `text-embedding-3-small`

---

**Última Atualização**: 2025-01-15

