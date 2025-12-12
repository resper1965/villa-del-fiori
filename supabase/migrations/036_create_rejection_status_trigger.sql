-- Migration: Trigger para atualizar status após rejeição
-- Descrição: Atualiza status do processo para "rejeitado" quando rejeição é criada

CREATE OR REPLACE FUNCTION update_process_status_on_rejection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar status do processo para rejeitado
  UPDATE processes
  SET status = 'rejeitado',
      updated_at = NOW()
  WHERE id = NEW.process_id
    AND status = 'em_revisao';

  -- Atualizar status da versão também
  UPDATE process_versions
  SET status = 'rejeitado'
  WHERE id = NEW.version_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_process_status_on_rejection IS 'Atualiza status do processo para rejeitado quando uma rejeição é criada';

-- Criar trigger após inserção de rejeição
DROP TRIGGER IF EXISTS trigger_update_status_on_rejection ON rejections;

CREATE TRIGGER trigger_update_status_on_rejection
  AFTER INSERT ON rejections
  FOR EACH ROW
  EXECUTE FUNCTION update_process_status_on_rejection();

COMMENT ON TRIGGER trigger_update_status_on_rejection ON rejections IS 'Atualiza status do processo automaticamente após rejeição';



