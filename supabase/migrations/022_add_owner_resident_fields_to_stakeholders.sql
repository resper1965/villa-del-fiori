-- Migration: Adicionar campos de proprietário/morador em stakeholders
-- Descrição: Adiciona suporte para distinguir proprietários de moradores e relacionar locatários com proprietários

-- Criar ENUM para relationship_type se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
        CREATE TYPE relationship_type AS ENUM ('proprietario', 'morador', 'proprietario_morador');
    END IF;
END $$;

-- Adicionar colunas na tabela stakeholders
DO $$
BEGIN
    -- relationship_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'relationship_type'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN relationship_type relationship_type;
    END IF;

    -- is_owner
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'is_owner'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN is_owner BOOLEAN DEFAULT false;
    END IF;

    -- is_resident
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'is_resident'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN is_resident BOOLEAN DEFAULT true;
    END IF;

    -- owner_id (self-referential foreign key)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN owner_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL;
        
        -- Criar índice para owner_id
        CREATE INDEX IF NOT EXISTS idx_stakeholders_owner_id ON stakeholders(owner_id);
    END IF;
END $$;

-- Atualizar dados existentes: assumir que stakeholders existentes são moradores
UPDATE stakeholders 
SET 
    is_resident = true,
    is_owner = false,
    relationship_type = 'morador'
WHERE relationship_type IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN stakeholders.relationship_type IS 'Tipo de vínculo: proprietario, morador, proprietario_morador';
COMMENT ON COLUMN stakeholders.is_owner IS 'Indica se o stakeholder é proprietário da unidade';
COMMENT ON COLUMN stakeholders.is_resident IS 'Indica se o stakeholder mora na unidade';
COMMENT ON COLUMN stakeholders.owner_id IS 'Referência ao proprietário (se for locatário)';

-- Constraints de validação
ALTER TABLE stakeholders 
DROP CONSTRAINT IF EXISTS check_relationship_type_consistency;

ALTER TABLE stakeholders 
ADD CONSTRAINT check_relationship_type_consistency 
CHECK (
    (relationship_type = 'proprietario' AND is_owner = true AND is_resident = false) OR
    (relationship_type = 'morador' AND is_owner = false AND is_resident = true) OR
    (relationship_type = 'proprietario_morador' AND is_owner = true AND is_resident = true) OR
    (relationship_type IS NULL)
);

-- Constraint: locatário deve ter owner_id
ALTER TABLE stakeholders 
DROP CONSTRAINT IF EXISTS check_tenant_has_owner;

ALTER TABLE stakeholders 
ADD CONSTRAINT check_tenant_has_owner 
CHECK (
    (relationship_type != 'morador' OR owner_id IS NOT NULL OR is_owner = true) OR
    (relationship_type IS NULL)
);

