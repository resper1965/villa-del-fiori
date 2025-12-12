-- Migration: Função para refazer processo (criar nova versão)
-- Descrição: Cria nova versão baseada na versão atual quando processo é rejeitado

CREATE OR REPLACE FUNCTION refactor_process(
  p_process_id UUID,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_process_status TEXT;
  v_creator_id UUID;
  v_current_user_id UUID;
  v_stakeholder_id UUID;
  v_current_version_number INTEGER;
  v_new_version_number INTEGER;
  v_current_version_id UUID;
  v_current_content JSONB;
  v_current_content_text TEXT;
  v_current_entities JSONB;
  v_current_variables JSONB;
BEGIN
  -- Obter ID do usuário atual
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Buscar stakeholder do usuário atual
  SELECT id INTO v_stakeholder_id
  FROM stakeholders
  WHERE email = (SELECT email FROM auth.users WHERE id = v_current_user_id)
  LIMIT 1;

  IF v_stakeholder_id IS NULL THEN
    RAISE EXCEPTION 'Stakeholder not found for user';
  END IF;

  -- Buscar processo
  SELECT status, creator_id, current_version_number
  INTO v_process_status, v_creator_id, v_current_version_number
  FROM processes
  WHERE id = p_process_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Process not found';
  END IF;

  -- Validar que processo está rejeitado
  IF v_process_status != 'rejeitado' THEN
    RAISE EXCEPTION 'Apenas processos rejeitados podem ser refeitos';
  END IF;

  -- Validar que usuário é o criador
  IF v_creator_id != v_stakeholder_id THEN
    RAISE EXCEPTION 'Apenas o criador do processo pode refazê-lo';
  END IF;

  -- Buscar versão atual
  SELECT id, content, content_text, entities_involved, variables_applied
  INTO v_current_version_id, v_current_content, v_current_content_text, v_current_entities, v_current_variables
  FROM process_versions
  WHERE process_id = p_process_id
    AND version_number = v_current_version_number
  LIMIT 1;

  IF v_current_version_id IS NULL THEN
    RAISE EXCEPTION 'Versão atual não encontrada';
  END IF;

  -- Calcular nova versão
  v_new_version_number := COALESCE(v_current_version_number, 0) + 1;

  -- Criar nova versão baseada na versão atual
  INSERT INTO process_versions (
    process_id,
    version_number,
    content,
    content_text,
    entities_involved,
    variables_applied,
    previous_version_id,
    change_summary,
    created_by,
    status
  ) VALUES (
    p_process_id,
    v_new_version_number,
    v_current_content,
    v_current_content_text,
    v_current_entities,
    v_current_variables,
    v_current_version_id,
    p_change_summary,
    v_stakeholder_id,
    'rascunho'
  );

  -- Atualizar processo com nova versão e status rascunho
  UPDATE processes
  SET current_version_number = v_new_version_number,
      status = 'rascunho',
      updated_at = NOW()
  WHERE id = p_process_id;

  RETURN v_new_version_number;
END;
$$;

COMMENT ON FUNCTION refactor_process IS 'Cria nova versão de um processo rejeitado, permitindo refazer baseado em feedback';



