-- Migration: Criar tabela de Veículos
-- Descrição: Adiciona suporte para cadastro de veículos (carros, motos, etc.) associados a unidades/stakeholders

-- Criar tabela de veículos
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,  -- Unidade associada
    stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,  -- Stakeholder proprietário (opcional, pode ser inferido da unidade)
    brand VARCHAR(100) NOT NULL,  -- Marca (ex: "Toyota", "Honda", "Fiat")
    model VARCHAR(100) NOT NULL,  -- Modelo (ex: "Corolla", "Civic", "Uno")
    license_plate VARCHAR(10) NOT NULL UNIQUE,  -- Placa (formato: ABC1234 ou ABC1D23)
    color VARCHAR(50),  -- Cor do veículo
    year INTEGER,  -- Ano de fabricação
    vehicle_type VARCHAR(50) DEFAULT 'carro',  -- Tipo: carro, moto, caminhao, etc.
    notes TEXT,  -- Observações adicionais
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir que tenha pelo menos unit_id ou stakeholder_id
    CONSTRAINT vehicles_owner_check CHECK (
        (unit_id IS NOT NULL) OR (stakeholder_id IS NOT NULL)
    )
);

-- Criar índices para veículos
CREATE INDEX IF NOT EXISTS idx_vehicles_unit_id ON vehicles(unit_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_stakeholder_id ON vehicles(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);

-- Comentários para documentação
COMMENT ON TABLE vehicles IS 'Representa veículos cadastrados no condomínio, associados a unidades ou stakeholders';
COMMENT ON COLUMN vehicles.unit_id IS 'Unidade (apartamento) à qual o veículo pertence';
COMMENT ON COLUMN vehicles.stakeholder_id IS 'Stakeholder proprietário do veículo (opcional, pode ser inferido da unidade)';
COMMENT ON COLUMN vehicles.brand IS 'Marca do veículo (ex: Toyota, Honda, Fiat)';
COMMENT ON COLUMN vehicles.model IS 'Modelo do veículo (ex: Corolla, Civic, Uno)';
COMMENT ON COLUMN vehicles.license_plate IS 'Placa do veículo (formato: ABC1234 ou ABC1D23) - único';
COMMENT ON COLUMN vehicles.color IS 'Cor do veículo';
COMMENT ON COLUMN vehicles.year IS 'Ano de fabricação do veículo';
COMMENT ON COLUMN vehicles.vehicle_type IS 'Tipo de veículo: carro, moto, caminhao, etc.';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para normalizar placa (remover espaços e converter para maiúsculas)
CREATE OR REPLACE FUNCTION normalize_license_plate(plate TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(REPLACE(REPLACE(plate, ' ', ''), '-', ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para normalizar placa antes de inserir/atualizar
CREATE OR REPLACE FUNCTION normalize_vehicle_license_plate()
RETURNS TRIGGER AS $$
BEGIN
    NEW.license_plate = normalize_license_plate(NEW.license_plate);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_vehicle_plate_trigger
    BEFORE INSERT OR UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION normalize_vehicle_license_plate();

