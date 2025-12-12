-- Migration: Atualizar tabela entities (se existir)
-- Descrição: Remove relacionamento com unidades e adiciona relacionamento com condomínios

DO $$
BEGIN
    -- Verificar se a tabela entities existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'entities'
    ) THEN
        -- Adicionar condominium_id se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'entities' 
            AND column_name = 'condominium_id'
        ) THEN
            ALTER TABLE entities 
            ADD COLUMN condominium_id UUID REFERENCES condominiums(id) ON DELETE SET NULL;
            
            CREATE INDEX IF NOT EXISTS idx_entities_condominium_id ON entities(condominium_id) WHERE condominium_id IS NOT NULL;
        END IF;

        -- Remover unit_id se existir (entidades são externas, não vinculadas a unidades)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'entities' 
            AND column_name = 'unit_id'
        ) THEN
            -- Remover índice primeiro
            DROP INDEX IF EXISTS idx_entities_unit_id;
            
            -- Remover coluna
            ALTER TABLE entities 
            DROP COLUMN unit_id;
        END IF;
        
        COMMENT ON COLUMN entities.condominium_id IS 'Condomínio associado (opcional - entidades podem ser gerais ou específicas de um condomínio)';
    END IF;
END $$;

