-- Migration: Criar tabela de Unidades e relacionar com Stakeholders
-- Descrição: Adiciona suporte para unidades (apartamentos) e relaciona stakeholders com suas unidades

-- Criar tabela de unidades (apartamentos)
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) NOT NULL UNIQUE,  -- Número da unidade (ex: "101", "Apto 201", "Casa 1")
    block VARCHAR(50),  -- Bloco (se aplicável)
    floor INTEGER,  -- Andar (se aplicável)
    area DECIMAL(10, 2),  -- Área em m²
    parking_spots INTEGER DEFAULT 0,  -- Número de vagas de garagem
    description TEXT,  -- Descrição adicional
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para unidades
CREATE INDEX IF NOT EXISTS idx_units_number ON units(number);
CREATE INDEX IF NOT EXISTS idx_units_block ON units(block);
CREATE INDEX IF NOT EXISTS idx_units_is_active ON units(is_active);

-- Adicionar coluna unit_id na tabela stakeholders (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'unit_id'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN unit_id UUID REFERENCES units(id) ON DELETE SET NULL;
        
        -- Criar índice para unit_id
        CREATE INDEX IF NOT EXISTS idx_stakeholders_unit_id ON stakeholders(unit_id);
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON TABLE units IS 'Representa unidades (apartamentos/casas) do condomínio';
COMMENT ON COLUMN units.number IS 'Número identificador da unidade (ex: "101", "Apto 201")';
COMMENT ON COLUMN units.block IS 'Bloco do condomínio (se aplicável)';
COMMENT ON COLUMN units.floor IS 'Andar da unidade (se aplicável)';
COMMENT ON COLUMN units.area IS 'Área da unidade em metros quadrados';
COMMENT ON COLUMN units.parking_spots IS 'Número de vagas de garagem da unidade';
COMMENT ON COLUMN stakeholders.unit_id IS 'Unidade (apartamento) associada ao stakeholder. Obrigatório para moradores, síndicos, subsíndicos e conselheiros. Opcional para staff e administradora.';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

