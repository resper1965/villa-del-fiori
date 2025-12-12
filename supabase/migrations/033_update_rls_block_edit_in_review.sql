-- Migration: Atualizar RLS para bloquear edição quando processo está em revisão
-- Descrição: Garantir que apenas o criador pode editar processos em rascunho

-- Nota: As políticas RLS existentes já devem estar configuradas
-- Esta migration adiciona validações adicionais se necessário

-- Criar função auxiliar para verificar se usuário é criador
CREATE OR REPLACE FUNCTION is_process_creator(p_process_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_creator_id UUID;
  v_current_user_id UUID;
  v_stakeholder_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar stakeholder do usuário atual
  SELECT id INTO v_stakeholder_id
  FROM stakeholders
  WHERE email = (SELECT email FROM auth.users WHERE id = v_current_user_id)
  LIMIT 1;

  IF v_stakeholder_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar criador do processo
  SELECT creator_id INTO v_creator_id
  FROM processes
  WHERE id = p_process_id;

  RETURN v_creator_id = v_stakeholder_id;
END;
$$;

COMMENT ON FUNCTION is_process_creator IS 'Verifica se o usuário atual é o criador do processo';

-- Adicionar constraint para garantir que processos em revisão não podem ter status alterado diretamente
-- (exceto através das funções apropriadas)
-- Nota: Esta validação será feita na aplicação, mas podemos adicionar um trigger como segurança extra

CREATE OR REPLACE FUNCTION prevent_direct_status_change_to_review()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se está tentando mudar status para em_revisao diretamente (sem usar a função)
  -- e o status anterior não era rascunho, bloquear
  IF NEW.status = 'em_revisao' AND OLD.status != 'rascunho' AND OLD.status != 'em_revisao' THEN
    RAISE EXCEPTION 'Status não pode ser alterado diretamente para em_revisao. Use a função submit_process_for_approval.';
  END IF;

  -- Se está tentando mudar status de em_revisao para rascunho diretamente, bloquear
  IF OLD.status = 'em_revisao' AND NEW.status = 'rascunho' THEN
    RAISE EXCEPTION 'Processo em revisão não pode voltar para rascunho diretamente. Use a função refactor_process para criar nova versão.';
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger (se ainda não existir)
DROP TRIGGER IF EXISTS trigger_prevent_direct_status_change ON processes;

CREATE TRIGGER trigger_prevent_direct_status_change
  BEFORE UPDATE OF status ON processes
  FOR EACH ROW
  EXECUTE FUNCTION prevent_direct_status_change_to_review();

COMMENT ON TRIGGER trigger_prevent_direct_status_change ON processes IS 'Previne mudanças diretas de status que devem passar por funções específicas';



