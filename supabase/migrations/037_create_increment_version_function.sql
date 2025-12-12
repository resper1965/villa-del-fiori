-- Migration: Função para criar nova versão de processo
-- Descrição: Cria nova versão incrementando número e mantendo histórico

-- Esta função já está parcialmente implementada em refactor_process
-- Mas podemos criar uma versão mais genérica se necessário

-- A função refactor_process já faz o incremento de versão
-- Esta migration apenas documenta e garante que a lógica está correta

-- Verificar se a função refactor_process já existe (criada na migration 032)
-- Se sim, não precisamos criar novamente

-- Adicionar comentário explicativo
COMMENT ON FUNCTION refactor_process IS 'Cria nova versão de processo rejeitado, incrementando automaticamente o número da versão e mantendo histórico completo';

-- Garantir que a sequência de versões está correta
-- Criar função auxiliar para obter próximo número de versão
CREATE OR REPLACE FUNCTION get_next_version_number(p_process_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
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

COMMENT ON FUNCTION get_next_version_number IS 'Retorna o próximo número de versão para um processo';



