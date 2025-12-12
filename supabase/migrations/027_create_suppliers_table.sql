-- Migration: Criar tabela de Fornecedores
-- Descrição: Cria tabela para cadastro de fornecedores do condomínio

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    cpf VARCHAR(14), -- Se for pessoa física
    email VARCHAR(255),
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_number VARCHAR(50),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zipcode VARCHAR(10),
    supplier_type VARCHAR(50) NOT NULL, -- 'administradora', 'portaria_virtual', 'elevador', 'gerador', 'limpeza', 'seguranca', 'outro'
    category VARCHAR(50), -- 'servico', 'manutencao', 'administracao'
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contract_start_date DATE,
    contract_end_date DATE,
    monthly_value DECIMAL(10, 2),
    payment_day INTEGER, -- Dia do mês para pagamento
    notes TEXT,
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT suppliers_cnpj_cpf_check CHECK (
        (cnpj IS NOT NULL AND cpf IS NULL) OR 
        (cnpj IS NULL AND cpf IS NOT NULL) OR 
        (cnpj IS NULL AND cpf IS NULL)
    )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_suppliers_condominium_id ON suppliers(condominium_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_cnpj ON suppliers(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_suppliers_cpf ON suppliers(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE suppliers IS 'Fornecedores de serviços do condomínio (administradora, portaria virtual, elevadores, etc.)';
COMMENT ON COLUMN suppliers.supplier_type IS 'Tipo de fornecedor (administradora, portaria_virtual, elevador, gerador, limpeza, seguranca, outro)';
COMMENT ON COLUMN suppliers.category IS 'Categoria do serviço (servico, manutencao, administracao)';
COMMENT ON COLUMN suppliers.payment_day IS 'Dia do mês para pagamento do fornecedor';



