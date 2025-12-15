-- Migration: Fix Security Issues
-- Data: 2025-01-15
-- Descrição: Corrigir problemas de segurança identificados pelos advisors

-- 1. Remover view que expõe auth.users
DROP VIEW IF EXISTS public.auth_users_with_metadata CASCADE;

-- 2. Habilitar RLS em knowledge_base_documents
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para knowledge_base_documents
-- Usuários autenticados podem visualizar documentos de processos aprovados
CREATE POLICY "Authenticated users can view knowledge base documents"
ON public.knowledge_base_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.processes p
    JOIN public.process_versions pv ON pv.process_id = p.id
    WHERE pv.id = knowledge_base_documents.process_version_id
    AND p.status = 'aprovado'
  )
);

-- Apenas service role pode inserir/atualizar (via Edge Functions)
CREATE POLICY "Service role can manage knowledge base documents"
ON public.knowledge_base_documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Habilitar RLS em knowledge_base_ingestion_status
ALTER TABLE public.knowledge_base_ingestion_status ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para knowledge_base_ingestion_status
-- Usuários autenticados podem visualizar status de ingestão
CREATE POLICY "Authenticated users can view ingestion status"
ON public.knowledge_base_ingestion_status
FOR SELECT
TO authenticated
USING (true);

-- Apenas service role pode inserir/atualizar (via Edge Functions)
CREATE POLICY "Service role can manage ingestion status"
ON public.knowledge_base_ingestion_status
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Adicionar índices para foreign keys faltantes (performance)
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id 
ON public.chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_kb_ingestion_process_version_id 
ON public.knowledge_base_ingestion_status(process_version_id);

CREATE INDEX IF NOT EXISTS idx_notifications_stakeholder_id 
ON public.notifications(stakeholder_id);

CREATE INDEX IF NOT EXISTS idx_process_versions_created_by 
ON public.process_versions(created_by);

CREATE INDEX IF NOT EXISTS idx_process_versions_previous_version_id 
ON public.process_versions(previous_version_id);

CREATE INDEX IF NOT EXISTS idx_rejections_addressed_in_version_id 
ON public.rejections(addressed_in_version_id);

CREATE INDEX IF NOT EXISTS idx_stakeholders_approved_by 
ON public.stakeholders(approved_by);

-- 5. Remover índices duplicados
DROP INDEX IF EXISTS public.idx_chat_messages_conversation_created_at;
DROP INDEX IF EXISTS public.ix_stakeholders_auth_user_id;

