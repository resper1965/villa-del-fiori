-- Migration: Criar tabela de Condomínios
-- Descrição: Cria a tabela de condomínios como entidade raiz do sistema

CREATE TABLE IF NOT EXISTS condominiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(50),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(10),
    total_units INTEGER,
    total_floors INTEGER,
    total_blocks INTEGER,
    has_elevator BOOLEAN DEFAULT false,
    has_pool BOOLEAN DEFAULT false,
    has_gym BOOLEAN DEFAULT false,
    has_party_room BOOLEAN DEFAULT false,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_condominiums_name ON condominiums(name);
CREATE INDEX IF NOT EXISTS idx_condominiums_cnpj ON condominiums(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_condominiums_is_active ON condominiums(is_active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_condominiums_updated_at BEFORE UPDATE ON condominiums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE condominiums IS 'Tabela de condomínios - entidade raiz do sistema';
COMMENT ON COLUMN condominiums.name IS 'Nome do condomínio';
COMMENT ON COLUMN condominiums.cnpj IS 'CNPJ do condomínio (se houver)';
COMMENT ON COLUMN condominiums.total_units IS 'Total de unidades do condomínio';
COMMENT ON COLUMN condominiums.total_floors IS 'Total de andares';
COMMENT ON COLUMN condominiums.total_blocks IS 'Total de blocos';



