-- Migration: Trigger para atualizar status após aprovação
-- Descrição: Executa função de verificação após cada aprovação

-- Criar trigger após inserção de aprovação
DROP TRIGGER IF EXISTS trigger_check_approval_status ON approvals;

CREATE TRIGGER trigger_check_approval_status
  AFTER INSERT ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION check_and_update_process_status();

COMMENT ON TRIGGER trigger_check_approval_status ON approvals IS 'Atualiza status do processo automaticamente após aprovação';



