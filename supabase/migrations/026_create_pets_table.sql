-- Migration: Criar tabela de Pets
-- Descrição: Cria tabela para cadastro de pets vinculados a unidades

CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    species VARCHAR(50) NOT NULL, -- 'cachorro', 'gato', 'ave', 'outro'
    breed VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(20), -- 'pequeno', 'medio', 'grande'
    weight DECIMAL(5, 2),
    birth_date DATE,
    microchip_number VARCHAR(50),
    vaccination_status VARCHAR(50), -- 'em_dia', 'atrasado', 'nao_aplicavel'
    last_vaccination_date DATE,
    notes TEXT,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL, -- Proprietário do pet
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pets_unit_id ON pets(unit_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_microchip ON pets(microchip_number) WHERE microchip_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pets_is_active ON pets(is_active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE pets IS 'Pets cadastrados no condomínio, vinculados a unidades';
COMMENT ON COLUMN pets.species IS 'Espécie do animal (cachorro, gato, ave, outro)';
COMMENT ON COLUMN pets.size IS 'Porte do animal (pequeno, medio, grande)';
COMMENT ON COLUMN pets.microchip_number IS 'Número do microchip (se houver)';
COMMENT ON COLUMN pets.vaccination_status IS 'Status de vacinação (em_dia, atrasado, nao_aplicavel)';
COMMENT ON COLUMN pets.owner_id IS 'Proprietário do pet (stakeholder)';



