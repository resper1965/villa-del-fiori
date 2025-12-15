# Documentos Gerais - Sistema de Upload e Indexação

**Data**: 2025-01-15  
**Sistema**: Gabi - Síndica Virtual

---

## 📄 Visão Geral

O sistema de **Documentos Gerais** permite o upload e gerenciamento de documentos que não são processos aprovados, como:
- **Regulamentos**
- **Convenções**
- **Atas**
- **Assembleias**
- **Editais**
- **Comunicados**
- **Outros documentos**

Todos os documentos são **automaticamente indexados na base de conhecimento** para que o Chat com Gabi possa responder perguntas sobre eles.

---

## 🎯 Funcionalidades

### 1. **Upload de Documentos**

- Upload de arquivos de texto (PDF, DOCX, TXT, MD)
- Cadastro manual de conteúdo
- Categorização por tipo de documento
- Descrição opcional

### 2. **Indexação Automática**

- Documentos são automaticamente divididos em chunks
- Embeddings são gerados para cada chunk
- Integração com `knowledge_base_documents`
- Status de ingestão rastreado

### 3. **Gerenciamento**

- Lista de todos os documentos
- Status de indexação (pendente, processando, indexado, erro)
- Remoção de documentos
- Filtros por tipo e categoria

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
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT DEFAULT 'text/markdown',
    embedding VECTOR(1536),
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

1. Usuário faz upload ou cadastra conteúdo
2. Documento é salvo na tabela `documents`
3. Status inicial: `pending`

### 2. Processamento

1. Edge Function ou job detecta documento pendente
2. Status muda para `processing`
3. Conteúdo é dividido em chunks
4. Embeddings são gerados para cada chunk
5. Chunks são salvos em `knowledge_base_documents`

### 3. Finalização

1. Status muda para `completed`
2. `chunks_count` é atualizado
3. `ingested_at` é registrado
4. Documento fica disponível na base de conhecimento

### 4. Em Caso de Erro

1. Status muda para `failed`
2. `ingestion_error` armazena a mensagem de erro
3. Documento pode ser reprocessado

---

## 📊 Integração com Base de Conhecimento

### Estrutura de Chunks

Os documentos são divididos em chunks e armazenados em `knowledge_base_documents`:

- **`chunk_type`**: `'content'` (para documentos gerais)
- **`content`**: Texto do chunk
- **`metadata`**: Metadados do documento (tipo, categoria, título)
- **`embedding`**: Vetor de 1536 dimensões

### Busca Semântica

Quando um usuário faz uma pergunta no chat:
1. A pergunta é convertida em embedding
2. O sistema busca chunks similares em `knowledge_base_documents`
3. Chunks de processos aprovados E documentos gerais são retornados
4. O LLM gera resposta baseada em todos os chunks relevantes

---

## 🎨 Interface

### Página: `/documents`

- **Estatísticas**: Total, Indexados, Pendentes, Com Erro
- **Lista de Documentos**: 
  - Título e tipo
  - Descrição
  - Status de indexação
  - Número de chunks
  - Data de indexação
  - Ações (editar, remover)

### Formulário de Upload

- Campo de título (obrigatório)
- Campo de conteúdo (texto ou upload de arquivo)
- Seleção de tipo de documento
- Campo de categoria
- Campo de descrição (opcional)

---

## 📝 Próximos Passos

### Implementações Pendentes

1. **Formulário de Upload**: Criar componente para upload/cadastro
2. **Processamento Automático**: Edge Function para processar documentos
3. **Extração de Texto**: Suporte para PDF e DOCX
4. **Reprocessamento**: Botão para reprocessar documentos com erro
5. **Visualização**: Visualizar conteúdo do documento
6. **Download**: Download do arquivo original

---

## 🔧 Configuração Técnica

### Edge Function (Futuro)

Uma Edge Function será criada para:
- Detectar documentos com status `pending`
- Dividir conteúdo em chunks
- Gerar embeddings via OpenAI
- Salvar chunks em `knowledge_base_documents`
- Atualizar status do documento

### Chunking Strategy

- Tamanho do chunk: ~500-1000 tokens
- Overlap: 100-200 tokens entre chunks
- Preservação de contexto: Manter parágrafos completos

---

**Última Atualização**: 2025-01-15

