-- Migration: Garantir apenas um condomínio ativo (mono-tenant)
-- Descrição: Adiciona constraint para garantir que apenas um condomínio possa estar ativo por vez
-- Projeto: obyrjbhomqtepebykavb
-- Data: 2025-01-15

-- Função para verificar se já existe um condomínio ativo
CREATE OR REPLACE FUNCTION check_single_active_condominium()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estamos ativando um condomínio (is_active = true)
  IF NEW.is_active = true THEN
    -- Verificar se já existe outro condomínio ativo
    IF EXISTS (
      SELECT 1 FROM condominiums 
      WHERE is_active = true 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Apenas um condomínio pode estar ativo por vez. A aplicação é mono-tenant.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para INSERT e UPDATE
DROP TRIGGER IF EXISTS enforce_single_active_condominium ON condominiums;
CREATE TRIGGER enforce_single_active_condominium
  BEFORE INSERT OR UPDATE ON condominiums
  FOR EACH ROW
  EXECUTE FUNCTION check_single_active_condominium();

-- Comentário
COMMENT ON FUNCTION check_single_active_condominium() IS 'Garante que apenas um condomínio possa estar ativo por vez (mono-tenant)';

-- Verificação: Execute esta query após aplicar para confirmar
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'check_single_active_condominium';
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'enforce_single_active_condominium';

