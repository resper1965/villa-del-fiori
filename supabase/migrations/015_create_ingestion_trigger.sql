-- Migration: Criar trigger para ingestão automática
-- Descrição: Trigger que marca processos aprovados para ingestão na base de conhecimento
-- Data: 2025-01-09

-- Função que será chamada quando um processo for aprovado
CREATE OR REPLACE FUNCTION trigger_knowledge_base_ingestion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger na tabela processes
CREATE TRIGGER trigger_process_approved_for_ingestion
  AFTER UPDATE OF status ON processes
  FOR EACH ROW
  WHEN (NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado'))
  EXECUTE FUNCTION trigger_knowledge_base_ingestion();

-- Função para quando uma nova versão de processo é criada e aprovada
CREATE OR REPLACE FUNCTION trigger_process_version_approved_for_ingestion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger na tabela process_versions (quando nova versão é criada)
-- Nota: Este trigger será útil quando novas versões forem criadas diretamente
CREATE TRIGGER trigger_process_version_approved_for_ingestion
  AFTER INSERT ON process_versions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_version_approved_for_ingestion();

-- Comentários
COMMENT ON FUNCTION trigger_knowledge_base_ingestion() IS 'Marca processos aprovados para ingestão na base de conhecimento';
COMMENT ON FUNCTION trigger_process_version_approved_for_ingestion() IS 'Marca novas versões aprovadas para ingestão na base de conhecimento';





