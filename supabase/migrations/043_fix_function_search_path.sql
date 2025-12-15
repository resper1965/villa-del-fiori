-- Migration: Fix Function Search Path
-- Data: 2025-01-15
-- Descrição: Adicionar SET search_path fixo em funções SQL para prevenir SQL injection

-- Função: check_and_update_process_status
CREATE OR REPLACE FUNCTION check_and_update_process_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_process_status TEXT;
  v_version_id UUID;
  v_process_id UUID;
  v_required_approvals INTEGER;
  v_current_approvals INTEGER;
BEGIN
  -- Obter informações da aprovação
  v_process_id := NEW.process_id;
  v_version_id := NEW.version_id;

  -- Buscar status atual do processo
  SELECT status INTO v_process_status
  FROM processes
  WHERE id = v_process_id;

  -- Se já está aprovado ou rejeitado, não fazer nada
  IF v_process_status IN ('aprovado', 'rejeitado') THEN
    RETURN NEW;
  END IF;

  -- Se não está em revisão, não fazer nada
  IF v_process_status != 'em_revisao' THEN
    RETURN NEW;
  END IF;

  -- Contar aprovações da versão atual
  SELECT COUNT(DISTINCT stakeholder_id) INTO v_current_approvals
  FROM approvals
  WHERE process_id = v_process_id
    AND version_id = v_version_id;

  -- Se há pelo menos 1 aprovação, mudar status para aprovado
  IF v_current_approvals >= 1 THEN
    UPDATE processes
    SET status = 'aprovado',
        updated_at = NOW()
    WHERE id = v_process_id
      AND status = 'em_revisao';

    -- Atualizar status da versão também
    UPDATE process_versions
    SET status = 'aprovado'
    WHERE id = v_version_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Função: search_knowledge_base
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id UUID,
  process_id UUID,
  process_version_id UUID,
  chunk_index INTEGER,
  chunk_type VARCHAR(50),
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  process_name TEXT,
  process_category TEXT
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.process_id,
    kb.process_version_id,
    kb.chunk_index,
    kb.chunk_type,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity,
    p.name AS process_name,
    p.category::TEXT AS process_category
  FROM knowledge_base_documents kb
  JOIN process_versions pv ON pv.id = kb.process_version_id
  JOIN processes p ON p.id = kb.process_id
  WHERE kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
    AND p.status = 'aprovado'
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Função: search_knowledge_base_hybrid
CREATE OR REPLACE FUNCTION search_knowledge_base_hybrid(
  query_embedding vector(1536),
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id UUID,
  process_id UUID,
  process_version_id UUID,
  chunk_index INTEGER,
  chunk_type VARCHAR(50),
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  process_name TEXT,
  process_category TEXT
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  vector_results RECORD;
  text_results RECORD;
  combined_results RECORD;
BEGIN
  -- Busca vetorial
  FOR vector_results IN
    SELECT
      kb.id,
      kb.process_id,
      kb.process_version_id,
      kb.chunk_index,
      kb.chunk_type,
      kb.content,
      kb.metadata,
      1 - (kb.embedding <=> query_embedding) AS similarity,
      p.name AS process_name,
      p.category::TEXT AS process_category
    FROM knowledge_base_documents kb
    JOIN process_versions pv ON pv.id = kb.process_version_id
    JOIN processes p ON p.id = kb.process_id
    WHERE kb.embedding IS NOT NULL
      AND 1 - (kb.embedding <=> query_embedding) > match_threshold
      AND p.status = 'aprovado'
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count
  LOOP
    RETURN NEXT vector_results;
  END LOOP;

  -- Busca full-text (se não encontrou resultados suficientes)
  IF NOT FOUND OR (SELECT COUNT(*) FROM knowledge_base_documents) < match_count THEN
    FOR text_results IN
      SELECT
        kb.id,
        kb.process_id,
        kb.process_version_id,
        kb.chunk_index,
        kb.chunk_type,
        kb.content,
        kb.metadata,
        0.5 AS similarity, -- Similaridade fixa para busca textual
        p.name AS process_name,
        p.category::TEXT AS process_category
      FROM knowledge_base_documents kb
      JOIN process_versions pv ON pv.id = kb.process_version_id
      JOIN processes p ON p.id = kb.process_id
      WHERE kb.content ILIKE '%' || query_text || '%'
        AND p.status = 'aprovado'
        AND kb.id NOT IN (SELECT id FROM (SELECT kb2.id FROM knowledge_base_documents kb2 WHERE kb2.embedding IS NOT NULL AND 1 - (kb2.embedding <=> query_embedding) > match_threshold LIMIT match_count) sub)
      LIMIT match_count
    LOOP
      RETURN NEXT text_results;
    END LOOP;
  END IF;
END;
$$;

-- Função: find_related_processes
CREATE OR REPLACE FUNCTION find_related_processes(
  p_process_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_process_embedding vector(1536);
BEGIN
  -- Buscar embedding do processo
  SELECT AVG(kb.embedding) INTO v_process_embedding
  FROM knowledge_base_documents kb
  JOIN process_versions pv ON pv.id = kb.process_version_id
  WHERE pv.process_id = p_process_id
    AND kb.embedding IS NOT NULL;

  IF v_process_embedding IS NULL THEN
    RETURN;
  END IF;

  -- Buscar processos similares
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.name,
    p.category::TEXT,
    1 - (AVG(kb2.embedding) <=> v_process_embedding) AS similarity
  FROM processes p
  JOIN process_versions pv2 ON pv2.process_id = p.id
  JOIN knowledge_base_documents kb2 ON kb2.process_version_id = pv2.id
  WHERE p.id != p_process_id
    AND p.status = 'aprovado'
    AND kb2.embedding IS NOT NULL
  GROUP BY p.id, p.name, p.category
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$;

-- Função: is_process_creator
CREATE OR REPLACE FUNCTION is_process_creator(p_process_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_creator_id UUID;
  v_current_user_id UUID;
BEGIN
  -- Obter ID do usuário atual
  v_current_user_id := (SELECT auth.uid());

  -- Se não há usuário autenticado, retornar false
  IF v_current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar creator_id do processo
  SELECT creator_id INTO v_creator_id
  FROM processes
  WHERE id = p_process_id;

  -- Verificar se o usuário atual é o criador
  RETURN EXISTS (
    SELECT 1
    FROM stakeholders
    WHERE auth_user_id = v_current_user_id
      AND id = v_creator_id
  );
END;
$$;

-- Função: prevent_direct_status_change_to_review
CREATE OR REPLACE FUNCTION prevent_direct_status_change_to_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Se está tentando mudar status diretamente para 'em_revisao'
  IF NEW.status = 'em_revisao' AND OLD.status != 'em_revisao' THEN
    -- Verificar se não está vindo de 'rascunho' (única transição permitida)
    IF OLD.status != 'rascunho' THEN
      RAISE EXCEPTION 'Processo em revisão não pode voltar para rascunho diretamente. Use a função refactor_process para criar nova versão.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Função: update_process_status_on_rejection
CREATE OR REPLACE FUNCTION update_process_status_on_rejection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Atualizar status do processo para 'rejeitado'
  UPDATE processes
  SET status = 'rejeitado',
      updated_at = NOW()
  WHERE id = NEW.process_id;

  -- Atualizar status da versão também
  UPDATE process_versions
  SET status = 'rejeitado'
  WHERE id = NEW.version_id;

  RETURN NEW;
END;
$$;

-- Função: refactor_process
CREATE OR REPLACE FUNCTION refactor_process(
  p_process_id UUID,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_new_version_id UUID;
  v_current_version_number INTEGER;
  v_next_version_number INTEGER;
  v_current_version_id UUID;
  v_creator_id UUID;
BEGIN
  -- Buscar versão atual
  SELECT 
    pv.id,
    pv.version_number,
    p.current_version_number,
    p.creator_id
  INTO 
    v_current_version_id,
    v_current_version_number,
    v_current_version_number,
    v_creator_id
  FROM processes p
  JOIN process_versions pv ON pv.process_id = p.id AND pv.version_number = p.current_version_number
  WHERE p.id = p_process_id;

  IF v_current_version_id IS NULL THEN
    RAISE EXCEPTION 'Processo não encontrado ou sem versão atual';
  END IF;

  -- Calcular próximo número de versão
  v_next_version_number := v_current_version_number + 1;

  -- Criar nova versão copiando conteúdo da versão atual
  INSERT INTO process_versions (
    process_id,
    version_number,
    content,
    content_text,
    variables_applied,
    entities_involved,
    created_by,
    status,
    previous_version_id,
    change_summary
  )
  SELECT 
    process_id,
    v_next_version_number,
    content,
    content_text,
    variables_applied,
    entities_involved,
    created_by,
    'rascunho',
    v_current_version_id,
    p_change_summary
  FROM process_versions
  WHERE id = v_current_version_id
  RETURNING id INTO v_new_version_id;

  -- Atualizar processo para apontar para nova versão
  UPDATE processes
  SET 
    current_version_number = v_next_version_number,
    status = 'rascunho',
    updated_at = NOW()
  WHERE id = p_process_id;

  RETURN v_new_version_id;
END;
$$;

-- Função: get_next_version_number
CREATE OR REPLACE FUNCTION get_next_version_number(p_process_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) INTO v_max_version
  FROM process_versions
  WHERE process_id = p_process_id;

  RETURN v_max_version + 1;
END;
$$;

