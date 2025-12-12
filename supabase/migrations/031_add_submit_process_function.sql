-- Migration: Função para enviar processo para aprovação
-- Descrição: Valida e atualiza status do processo para "em_revisao"

CREATE OR REPLACE FUNCTION submit_process_for_approval(p_process_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_process_status TEXT;
  v_creator_id UUID;
  v_current_user_id UUID;
  v_stakeholder_id UUID;
  v_current_version_number INTEGER;
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

  -- Validar que processo está em rascunho
  IF v_process_status != 'rascunho' THEN
    RAISE EXCEPTION 'Processo deve estar em rascunho para ser enviado para aprovação';
  END IF;

  -- Validar que usuário é o criador
  IF v_creator_id != v_stakeholder_id THEN
    RAISE EXCEPTION 'Apenas o criador do processo pode enviá-lo para aprovação';
  END IF;

  -- Validar que processo tem versão atual
  IF v_current_version_number IS NULL THEN
    RAISE EXCEPTION 'Processo deve ter uma versão para ser enviado para aprovação';
  END IF;

  -- Atualizar status do processo
  UPDATE processes
  SET status = 'em_revisao',
      updated_at = NOW()
  WHERE id = p_process_id;

  -- Atualizar status da versão atual
  UPDATE process_versions
  SET status = 'em_revisao'
  WHERE process_id = p_process_id
    AND version_number = v_current_version_number;

END;
$$;

COMMENT ON FUNCTION submit_process_for_approval IS 'Envia um processo de rascunho para aprovação, mudando status para em_revisao';



