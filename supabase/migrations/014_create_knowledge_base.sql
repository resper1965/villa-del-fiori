-- Migration: Criar tabela de base de conhecimento
-- Descrição: Tabela para armazenar documentos indexados da base de conhecimento com embeddings
-- Data: 2025-01-09

-- Tabela principal de documentos da base de conhecimento
CREATE TABLE IF NOT EXISTS knowledge_base_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referência ao processo e versão
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  process_version_id UUID REFERENCES process_versions(id) ON DELETE CASCADE,
  
  -- Informações do chunk
  chunk_index INTEGER NOT NULL DEFAULT 0, -- Índice do chunk no processo (0 = primeiro chunk)
  chunk_type VARCHAR(50) NOT NULL DEFAULT 'content', -- Tipo: 'name', 'description', 'workflow', 'entities', 'variables', 'raci'
  
  -- Conteúdo do chunk
  content TEXT NOT NULL, -- Texto do chunk para busca
  metadata JSONB DEFAULT '{}', -- Metadados adicionais (categoria, tipo de documento, etc.)
  
  -- Embedding vetorial (OpenAI text-embedding-3-small = 1536 dimensões)
  embedding vector(1536),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_chunk_type CHECK (chunk_type IN ('name', 'description', 'workflow', 'entities', 'variables', 'raci', 'content'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_kb_docs_process_id ON knowledge_base_documents(process_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_process_version_id ON knowledge_base_documents(process_version_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_chunk_type ON knowledge_base_documents(chunk_type);
CREATE INDEX IF NOT EXISTS idx_kb_docs_created_at ON knowledge_base_documents(created_at);

-- Índice vetorial para busca por similaridade (usando IVFFlat)
-- Nota: IVFFlat requer que a tabela tenha dados antes de criar o índice
-- Este índice será criado após a primeira ingestão de dados
-- CREATE INDEX idx_kb_docs_embedding ON knowledge_base_documents 
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Índice GIN para busca em metadata JSONB
CREATE INDEX IF NOT EXISTS idx_kb_docs_metadata ON knowledge_base_documents USING GIN (metadata);

-- Índice para busca full-text no conteúdo
CREATE INDEX IF NOT EXISTS idx_kb_docs_content_fts ON knowledge_base_documents 
USING GIN (to_tsvector('portuguese', content));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_knowledge_base_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_knowledge_base_documents_updated_at
  BEFORE UPDATE ON knowledge_base_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_documents_updated_at();

-- Comentários nas colunas
COMMENT ON TABLE knowledge_base_documents IS 'Documentos indexados da base de conhecimento com embeddings para busca semântica';
COMMENT ON COLUMN knowledge_base_documents.process_id IS 'ID do processo relacionado';
COMMENT ON COLUMN knowledge_base_documents.process_version_id IS 'ID da versão específica do processo';
COMMENT ON COLUMN knowledge_base_documents.chunk_index IS 'Índice sequencial do chunk no processo';
COMMENT ON COLUMN knowledge_base_documents.chunk_type IS 'Tipo do chunk: name, description, workflow, entities, variables, raci, content';
COMMENT ON COLUMN knowledge_base_documents.content IS 'Texto do chunk para busca e exibição';
COMMENT ON COLUMN knowledge_base_documents.metadata IS 'Metadados adicionais em formato JSON (categoria, tipo de documento, etc.)';
COMMENT ON COLUMN knowledge_base_documents.embedding IS 'Embedding vetorial do conteúdo (1536 dimensões - OpenAI text-embedding-3-small)';

-- Tabela para rastrear status de ingestão
CREATE TABLE IF NOT EXISTS knowledge_base_ingestion_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  process_version_id UUID REFERENCES process_versions(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  chunks_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Índices para status de ingestão
CREATE INDEX IF NOT EXISTS idx_kb_ingestion_process_id ON knowledge_base_ingestion_status(process_id);
CREATE INDEX IF NOT EXISTS idx_kb_ingestion_status ON knowledge_base_ingestion_status(status);
CREATE INDEX IF NOT EXISTS idx_kb_ingestion_created_at ON knowledge_base_ingestion_status(created_at);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_knowledge_base_ingestion_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_knowledge_base_ingestion_status_updated_at
  BEFORE UPDATE ON knowledge_base_ingestion_status
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_ingestion_status_updated_at();

COMMENT ON TABLE knowledge_base_ingestion_status IS 'Rastreamento do status de ingestão de processos na base de conhecimento';





