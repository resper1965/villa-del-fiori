-- Migration: Função para verificar e atualizar status do processo após aprovação
-- Descrição: Verifica se todos stakeholders necessários aprovaram e atualiza status para "aprovado"

CREATE OR REPLACE FUNCTION check_and_update_process_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- Por enquanto, considerar que 1 aprovação é suficiente
  -- TODO: Implementar lógica de stakeholders necessários por processo
  -- Por exemplo, pode ser necessário aprovação de síndico + conselho
  -- Por enquanto, simplificamos para 1 aprovação = aprovado
  
  -- Contar aprovações da versão atual
  SELECT COUNT(DISTINCT stakeholder_id) INTO v_current_approvals
  FROM approvals
  WHERE process_id = v_process_id
    AND version_id = v_version_id;

  -- Se há pelo menos 1 aprovação, mudar status para aprovado
  -- (Esta é uma simplificação - em produção, pode ser necessário mais aprovações)
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

COMMENT ON FUNCTION check_and_update_process_status IS 'Verifica se processo deve ser aprovado após nova aprovação e atualiza status automaticamente';



