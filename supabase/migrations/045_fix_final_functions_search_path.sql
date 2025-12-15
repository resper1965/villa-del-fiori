-- Migration: Fix Final Functions Search Path
-- Data: 2025-01-15
-- Descrição: Adicionar SET search_path fixo nas funções restantes

-- Função: generate_natural_description
CREATE OR REPLACE FUNCTION generate_natural_description(content_jsonb jsonb, process_name text DEFAULT ''::text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  result TEXT := '';
  description_text TEXT;
  workflow_text TEXT;
  entities_text TEXT;
  variables_text TEXT;
  step_jsonb JSONB;
  step_text TEXT;
  i INTEGER;
BEGIN
  -- Descrição principal (já é natural)
  IF content_jsonb->>'description' IS NOT NULL THEN
    description_text := content_jsonb->>'description';
    result := description_text || E'\n\n';
  END IF;

  -- Workflow em formato natural
  IF content_jsonb->'workflow' IS NOT NULL AND jsonb_typeof(content_jsonb->'workflow') = 'array' THEN
    IF jsonb_array_length(content_jsonb->'workflow') > 0 THEN
      result := result || 'O processo segue os seguintes passos: ';
      workflow_text := '';
      FOR i IN 0..jsonb_array_length(content_jsonb->'workflow') - 1 LOOP
        step_jsonb := content_jsonb->'workflow'->i;
        IF jsonb_typeof(step_jsonb) = 'string' THEN
          step_text := step_jsonb #>> '{}';
        ELSIF jsonb_typeof(step_jsonb) = 'object' THEN
          step_text := COALESCE(step_jsonb->>'step', step_jsonb->>'description', step_jsonb::text);
        ELSE
          step_text := step_jsonb::text;
        END IF;
        
        -- Remover numeração se existir (ex: "1. Passo" -> "Passo")
        step_text := regexp_replace(step_text, '^\d+\.\s*', '', 'g');
        
        IF i = 0 THEN
          workflow_text := step_text;
        ELSIF i = jsonb_array_length(content_jsonb->'workflow') - 1 THEN
          workflow_text := workflow_text || ' e, por fim, ' || LOWER(step_text);
        ELSE
          workflow_text := workflow_text || ', ' || LOWER(step_text);
        END IF;
      END LOOP;
      result := result || workflow_text || '.' || E'\n\n';
    END IF;
  END IF;

  -- Entidades em formato natural
  IF content_jsonb->'entities' IS NOT NULL AND jsonb_typeof(content_jsonb->'entities') = 'array' THEN
    IF jsonb_array_length(content_jsonb->'entities') > 0 THEN
      entities_text := array_to_string(
        ARRAY(SELECT jsonb_array_elements_text(content_jsonb->'entities')),
        ', '
      );
      result := result || 'As entidades envolvidas neste processo são: ' || entities_text || '.' || E'\n\n';
    END IF;
  END IF;

  -- Variáveis em formato natural (opcional, apenas se relevante)
  IF content_jsonb->'variables' IS NOT NULL THEN
    IF jsonb_typeof(content_jsonb->'variables') = 'array' AND jsonb_array_length(content_jsonb->'variables') > 0 THEN
      variables_text := array_to_string(
        ARRAY(SELECT jsonb_array_elements_text(content_jsonb->'variables')),
        ', '
      );
      result := result || 'Este processo utiliza as seguintes variáveis do sistema: ' || variables_text || '.' || E'\n\n';
    END IF;
  END IF;

  RETURN TRIM(result);
END;
$$;

-- Função: generate_content_text
CREATE OR REPLACE FUNCTION generate_content_text(content_jsonb jsonb, process_name text DEFAULT ''::text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  result TEXT := '';
  description_text TEXT;
  workflow_text TEXT;
  entities_text TEXT;
  variables_text TEXT;
  raci_text TEXT;
  step_jsonb JSONB;
  entry_jsonb JSONB;
  step_text TEXT;
  entry_text TEXT;
  i INTEGER;
  var_key TEXT;
  var_value TEXT;
BEGIN
  -- Nome do processo
  IF process_name IS NOT NULL AND process_name != '' THEN
    result := result || 'PROCESSO: ' || process_name || E'\n\n';
  END IF;

  -- Descrição
  IF content_jsonb->>'description' IS NOT NULL THEN
    description_text := content_jsonb->>'description';
    result := result || 'DESCRIÇÃO:' || E'\n' || description_text || E'\n\n';
  END IF;

  -- Workflow
  IF content_jsonb->'workflow' IS NOT NULL AND jsonb_typeof(content_jsonb->'workflow') = 'array' THEN
    IF jsonb_array_length(content_jsonb->'workflow') > 0 THEN
      result := result || 'FLUXO DO PROCESSO:' || E'\n';
      workflow_text := '';
      FOR i IN 0..jsonb_array_length(content_jsonb->'workflow') - 1 LOOP
        step_jsonb := content_jsonb->'workflow'->i;
        IF jsonb_typeof(step_jsonb) = 'string' THEN
          step_text := step_jsonb #>> '{}';
        ELSIF jsonb_typeof(step_jsonb) = 'object' THEN
          step_text := COALESCE(step_jsonb->>'step', step_jsonb->>'description', step_jsonb::text);
        ELSE
          step_text := step_jsonb::text;
        END IF;
        
        -- Remover numeração existente se houver (ex: "1. Passo" -> "Passo")
        step_text := regexp_replace(step_text, '^\d+\.\s*', '', 'g');
        
        workflow_text := workflow_text || (i + 1)::text || '. ' || step_text || E'\n';
      END LOOP;
      result := result || workflow_text || E'\n';
    END IF;
  END IF;

  -- Entidades
  IF content_jsonb->'entities' IS NOT NULL AND jsonb_typeof(content_jsonb->'entities') = 'array' THEN
    IF jsonb_array_length(content_jsonb->'entities') > 0 THEN
      entities_text := array_to_string(
        ARRAY(SELECT jsonb_array_elements_text(content_jsonb->'entities')),
        ', '
      );
      result := result || 'ENTIDADES ENVOLVIDAS: ' || entities_text || E'\n\n';
    END IF;
  END IF;

  -- Variáveis
  IF content_jsonb->'variables' IS NOT NULL THEN
    IF jsonb_typeof(content_jsonb->'variables') = 'array' AND jsonb_array_length(content_jsonb->'variables') > 0 THEN
      variables_text := array_to_string(
        ARRAY(SELECT jsonb_array_elements_text(content_jsonb->'variables')),
        ', '
      );
      result := result || 'VARIÁVEIS DO SISTEMA: ' || variables_text || E'\n\n';
    ELSIF jsonb_typeof(content_jsonb->'variables') = 'object' THEN
      variables_text := '';
      FOR var_key, var_value IN SELECT * FROM jsonb_each_text(content_jsonb->'variables') LOOP
        variables_text := variables_text || var_key || ': ' || var_value || E'\n';
      END LOOP;
      IF variables_text != '' THEN
        result := result || 'VARIÁVEIS DO SISTEMA:' || E'\n' || variables_text || E'\n';
      END IF;
    END IF;
  END IF;

  -- RACI
  IF content_jsonb->'raci' IS NOT NULL AND jsonb_typeof(content_jsonb->'raci') = 'array' THEN
    IF jsonb_array_length(content_jsonb->'raci') > 0 THEN
      result := result || 'RACI:' || E'\n';
      raci_text := '';
      FOR i IN 0..jsonb_array_length(content_jsonb->'raci') - 1 LOOP
        entry_jsonb := content_jsonb->'raci'->i;
        IF jsonb_typeof(entry_jsonb) = 'string' THEN
          entry_text := entry_jsonb #>> '{}';
        ELSIF jsonb_typeof(entry_jsonb) = 'object' THEN
          entry_text := COALESCE(entry_jsonb->>'role', 'N/A') || ': ' || COALESCE(entry_jsonb->>'responsible', 'N/A');
        ELSE
          entry_text := entry_jsonb::text;
        END IF;
        raci_text := raci_text || entry_text || E'\n';
      END LOOP;
      result := result || raci_text || E'\n';
    END IF;
  END IF;

  -- Diagrama Mermaid (se existir)
  IF content_jsonb->>'mermaid_diagram' IS NOT NULL THEN
    result := result || E'\nDIAGRAMA MERMAID:' || E'\n' || (content_jsonb->>'mermaid_diagram') || E'\n';
  END IF;

  RETURN TRIM(result);
END;
$$;

-- Função: update_chat_conversations_updated_at
CREATE OR REPLACE FUNCTION update_chat_conversations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Função: update_notifications_updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Função: update_process_version_content_text
CREATE OR REPLACE FUNCTION update_process_version_content_text()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  process_name TEXT;
BEGIN
  -- Buscar nome do processo
  SELECT name INTO process_name
  FROM processes
  WHERE id = NEW.process_id;

  -- Gerar content_text se não existir ou se content foi alterado
  IF NEW.content_text IS NULL OR OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.content_text := generate_content_text(NEW.content, process_name);
  END IF;

  -- Gerar natural_description se não existir ou se content foi alterado
  IF NEW.natural_description IS NULL OR OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.natural_description := generate_natural_description(NEW.content, process_name);
  END IF;

  RETURN NEW;
END;
$$;

-- Função: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Função: update_knowledge_base_documents_updated_at
CREATE OR REPLACE FUNCTION update_knowledge_base_documents_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Função: update_knowledge_base_ingestion_status_updated_at
CREATE OR REPLACE FUNCTION update_knowledge_base_ingestion_status_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Função: update_condominiums_updated_at
CREATE OR REPLACE FUNCTION update_condominiums_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Função: trigger_knowledge_base_ingestion
CREATE OR REPLACE FUNCTION trigger_knowledge_base_ingestion()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Quando um processo muda para status 'aprovado', marcar para ingestão
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    -- Inserir ou atualizar status de ingestão para a versão atual
    INSERT INTO knowledge_base_ingestion_status (
      process_id,
      process_version_id,
      status,
      started_at
    )
    SELECT 
      NEW.id,
      pv.id,
      'pending',
      NOW()
    FROM process_versions pv
    WHERE pv.process_id = NEW.id
      AND pv.version_number = NEW.current_version_number
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função: trigger_process_version_approved_for_ingestion
CREATE OR REPLACE FUNCTION trigger_process_version_approved_for_ingestion()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Verificar se o processo está aprovado
  IF EXISTS (
    SELECT 1 FROM processes 
    WHERE id = NEW.process_id 
      AND status = 'aprovado'
      AND current_version_number = NEW.version_number
  ) THEN
    -- Marcar para ingestão
    INSERT INTO knowledge_base_ingestion_status (
      process_id,
      process_version_id,
      status,
      started_at
    )
    VALUES (
      NEW.process_id,
      NEW.id,
      'pending',
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

