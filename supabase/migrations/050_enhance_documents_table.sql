-- Migration: Melhorar tabela de documentos gerais
-- Data: 2025-01-15
-- Descrição: Adicionar campos necessários para documentos gerais (regulamentos, convenções, atas, assembleias)

-- Adicionar campos necessários à tabela documents
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS document_type VARCHAR(50) DEFAULT 'outro',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ingestion_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ingestion_error TEXT,
  ADD COLUMN IF NOT EXISTS chunks_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ;

-- Adicionar constraint para document_type
ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS valid_document_type;

ALTER TABLE public.documents
  ADD CONSTRAINT valid_document_type CHECK (
    document_type IN ('regulamento', 'convencao', 'ata', 'assembleia', 'edital', 'comunicado', 'outro')
  );

-- Adicionar constraint para ingestion_status
ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS valid_ingestion_status;

ALTER TABLE public.documents
  ADD CONSTRAINT valid_ingestion_status CHECK (
    ingestion_status IN ('pending', 'processing', 'completed', 'failed')
  );

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_ingestion_status ON public.documents(ingestion_status);
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON public.documents(is_active);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem visualizar documentos ativos
DROP POLICY IF EXISTS "Authenticated users can view active documents" ON public.documents;
CREATE POLICY "Authenticated users can view active documents"
ON public.documents
FOR SELECT
TO authenticated
USING (is_active = true);

-- Política: Apenas admin/síndico/subsíndico podem criar documentos
DROP POLICY IF EXISTS "Admin/syndic/subsindico can create documents" ON public.documents;
CREATE POLICY "Admin/syndic/subsindico can create documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Política: Apenas admin/síndico/subsíndico podem atualizar documentos
DROP POLICY IF EXISTS "Admin/syndic/subsindico can update documents" ON public.documents;
CREATE POLICY "Admin/syndic/subsindico can update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Política: Apenas admin pode deletar documentos
DROP POLICY IF EXISTS "Admin can delete documents" ON public.documents;
CREATE POLICY "Admin can delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text = 'admin'
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Comentários
COMMENT ON COLUMN public.documents.document_type IS 'Tipo de documento: regulamento, convencao, ata, assembleia, edital, comunicado, outro';
COMMENT ON COLUMN public.documents.description IS 'Descrição do documento';
COMMENT ON COLUMN public.documents.uploaded_by IS 'ID do usuário que fez upload do documento';
COMMENT ON COLUMN public.documents.is_active IS 'Se o documento está ativo';
COMMENT ON COLUMN public.documents.ingestion_status IS 'Status de ingestão na base de conhecimento: pending, processing, completed, failed';
COMMENT ON COLUMN public.documents.ingestion_error IS 'Mensagem de erro caso a ingestão falhe';
COMMENT ON COLUMN public.documents.chunks_count IS 'Número de chunks gerados na base de conhecimento';
COMMENT ON COLUMN public.documents.ingested_at IS 'Data/hora da ingestão na base de conhecimento';

