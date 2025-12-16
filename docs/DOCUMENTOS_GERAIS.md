# Documentos Gerais - Sistema de Upload e Indexação

**Última Atualização**: 2025-01-15

---

## 📄 Visão Geral

O sistema de **Documentos Gerais** permite o upload e gerenciamento de documentos que não são processos aprovados, como regulamentos, convenções, atas, assembleias, editais e comunicados. Todos os documentos são **automaticamente indexados na base de conhecimento** para que o Chat com Gabi possa responder perguntas sobre eles.

---

## 🎯 Funcionalidades

### 1. **Upload de Documentos**

- ✅ Upload de arquivos de texto (PDF, DOCX, TXT, MD)
- ✅ Extração automática de conteúdo de arquivos
- ✅ Cadastro manual de conteúdo (copiar e colar)
- ✅ Edição do conteúdo extraído
- ✅ Categorização por tipo de documento
- ✅ Descrição opcional

### 2. **Indexação Automática**

- ✅ Documentos são automaticamente divididos em chunks
- ✅ Embeddings são gerados para cada chunk
- ✅ Integração com `knowledge_base_documents`
- ✅ Status de ingestão rastreado
- ✅ Disponíveis para busca no chat

### 3. **Gerenciamento**

- ✅ Lista de todos os documentos
- ✅ Status de indexação (pendente, processando, indexado, erro)
- ✅ Estatísticas (Total, Indexados, Pendentes, Com Erro)
- ✅ Edição de documentos
- ✅ Remoção de documentos
- ✅ Visualização de chunks gerados

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `documents`

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    document_type VARCHAR(50) DEFAULT 'outro',
    description TEXT,
    file_path TEXT,                      -- Caminho no Supabase Storage
    file_size INTEGER,                   -- Tamanho em bytes
    mime_type TEXT DEFAULT 'text/plain',
    embedding VECTOR(1536),              -- Embedding do documento completo (opcional)
    content_fts TSVECTOR,                -- Full-text search
    uploaded_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    ingestion_status VARCHAR(50) DEFAULT 'pending',
    ingestion_error TEXT,
    chunks_count INTEGER DEFAULT 0,
    ingested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tipos de Documento

- `regulamento`: Regulamentos do condomínio
- `convencao`: Convenção de condomínio
- `ata`: Atas de reuniões
- `assembleia`: Atas de assembleias
- `edital`: Editais
- `comunicado`: Comunicados
- `outro`: Outros documentos

### Categorias

- Governança
- Acesso e Segurança
- Operação
- Áreas Comuns
- Convivência
- Eventos
- Emergências
- Financeiro
- Jurídico
- Outro

### Status de Ingestão

- `pending`: Aguardando processamento
- `processing`: Em processamento
- `completed`: Indexado com sucesso
- `failed`: Erro na indexação

---

## 🔐 Segurança (RLS)

### Políticas de Acesso

1. **Visualização**: Todos os usuários autenticados podem visualizar documentos ativos
2. **Criação**: Apenas admin, síndico e subsíndico podem criar documentos
3. **Atualização**: Apenas admin, síndico e subsíndico podem atualizar documentos
4. **Remoção**: Apenas admin pode deletar documentos

---

## 🔄 Fluxo de Indexação

### 1. Upload do Documento

1. Usuário faz upload de arquivo ou cadastra conteúdo manualmente
2. Conteúdo é extraído automaticamente (se arquivo)
3. Documento é salvo na tabela `documents`
4. Status inicial: `pending`

### 2. Processamento

1. Edge Function `ingest-document` detecta documento pendente
2. Status muda para `processing`
3. Conteúdo é dividido em chunks (1000 caracteres, overlap 200)
4. Embeddings são gerados para cada chunk via OpenAI
5. Chunks são salvos em `knowledge_base_documents` com:
   - `process_id`: NULL
   - `chunk_type`: 'content'
   - `metadata`: Informações do documento (tipo, categoria, título)

### 3. Finalização

1. Status muda para `completed`
2. `chunks_count` é atualizado
3. `ingested_at` é registrado
4. Documento fica disponível na base de conhecimento

### 4. Em Caso de Erro

1. Status muda para `failed`
2. `ingestion_error` armazena a mensagem de erro
3. Documento pode ser reprocessado (editar e salvar novamente)

---

## 📊 Integração com Base de Conhecimento

### Estrutura de Chunks

Os documentos são divididos em chunks e armazenados em `knowledge_base_documents`:

- **`chunk_type`**: `'content'` (para documentos gerais)
- **`content`**: Texto do chunk
- **`metadata`**: Metadados do documento:
  ```json
  {
    "document_id": "uuid",
    "document_title": "Título do Documento",
    "document_type": "regulamento",
    "category": "Governança",
    "chunk_index": 0,
    "source": "document"
  }
  ```
- **`embedding`**: Vetor de 1536 dimensões

### Busca Semântica

Quando um usuário faz uma pergunta no chat:

1. A pergunta é convertida em embedding
2. O sistema busca chunks similares em `knowledge_base_documents`
3. Chunks de processos aprovados **E** documentos gerais são retornados
4. O LLM gera resposta baseada em todos os chunks relevantes

---

## 🎨 Interface

### Página: `/documents`

- **Estatísticas**: Total, Indexados, Pendentes, Com Erro
- **Lista de Documentos**: 
  - Título e tipo
  - Descrição
  - Status de indexação (com ícones)
  - Número de chunks
  - Data de indexação
  - Ações (editar, remover)

### Formulário de Upload

- Campo de título (obrigatório)
- Seleção de tipo de documento
- Seleção de categoria
- Campo de descrição (opcional)
- Upload de arquivo ou campo de conteúdo (texto)
- Preview do conteúdo extraído (editável)

---

## 📝 Formatos Suportados

### Upload de Arquivos

- ✅ **PDF** (.pdf) - Extração via `pdf-parse`
- ✅ **DOCX** (.docx) - Extração via `mammoth`
- ✅ **TXT** (.txt) - Leitura direta
- ✅ **MD** (.md) - Leitura direta
- ⚠️ **DOC** (.doc) - Não suportado (formato antigo)

### Limitações

- **Tamanho máximo**: 10MB por arquivo
- **PDF com imagens**: PDFs que contêm apenas imagens não terão conteúdo extraído
- **PDF escaneado**: PDFs escaneados (imagens de texto) não são processados por OCR

---

## 🔧 Configuração Técnica

### Edge Function: `ingest-document`

Processa documentos pendentes:

1. Busca documentos com status `pending`
2. Divide conteúdo em chunks (1000 caracteres, overlap 200)
3. Gera embeddings via OpenAI (text-embedding-3-small)
4. Remove chunks antigos do documento
5. Insere novos chunks em `knowledge_base_documents`
6. Atualiza status para `completed` ou `failed`

### API Route: `/api/ingest-document`

Endpoint que chama a Edge Function:

- Recebe `document_id`
- Invoca Edge Function `ingest-document`
- Retorna status da ingestão

### Storage: Supabase Bucket

- **Bucket**: `documents`
- **Caminho**: `documents/{user_id}/{timestamp}-{random}.{ext}`
- **Políticas**: Usuários autenticados podem fazer upload e visualizar

---

## 📈 Monitoramento

### Verificar Status de Ingestão

```sql
SELECT 
  title,
  document_type,
  category,
  ingestion_status,
  chunks_count,
  ingestion_error,
  ingested_at
FROM documents
ORDER BY created_at DESC;
```

### Estatísticas

- **Total de documentos**: `SELECT COUNT(*) FROM documents;`
- **Documentos indexados**: `SELECT COUNT(*) FROM documents WHERE ingestion_status = 'completed';`
- **Documentos pendentes**: `SELECT COUNT(*) FROM documents WHERE ingestion_status = 'pending';`
- **Documentos com erro**: `SELECT COUNT(*) FROM documents WHERE ingestion_status = 'failed';`

---

## 🎯 Benefícios

### Para Usuários

- ✅ **Centralização**: Todos os documentos em um só lugar
- ✅ **Busca Rápida**: Encontra informações instantaneamente via chat
- ✅ **Organização**: Categorização por tipo e categoria
- ✅ **Acesso Fácil**: Upload simples e extração automática

### Para o Sistema

- ✅ **Base de Conhecimento Completa**: Processos e documentos indexados
- ✅ **Busca Unificada**: Chat busca em processos e documentos
- ✅ **Rastreabilidade**: Status de ingestão sempre visível
- ✅ **Performance**: Busca vetorial eficiente

---

## 📚 Referências

- **Tabela**: `documents`
- **Tabela**: `knowledge_base_documents`
- **Edge Function**: `ingest-document`
- **API Route**: `/api/ingest-document`
- **Storage Bucket**: `documents`

---

**Última Atualização**: 2025-01-15
