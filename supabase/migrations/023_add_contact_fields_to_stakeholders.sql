-- Migration: Adicionar campos de contato em stakeholders
-- Descrição: Adiciona campos de contato (telefone, WhatsApp, endereço, contato de emergência) para moradores e proprietários

-- Campos de Contato
DO $$
BEGIN
    -- Telefone principal (celular)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN phone VARCHAR(20);
    END IF;

    -- Telefone secundário/fixo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'phone_secondary'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN phone_secondary VARCHAR(20);
    END IF;

    -- WhatsApp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'whatsapp'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN whatsapp VARCHAR(20);
    END IF;

    -- Indica se tem WhatsApp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'has_whatsapp'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN has_whatsapp BOOLEAN DEFAULT false;
    END IF;

    -- Endereço (se diferente da unidade)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'address_street'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN address_street VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'address_number'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN address_number VARCHAR(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'address_complement'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN address_complement VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'address_neighborhood'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN address_neighborhood VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'address_city'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN address_city VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'address_state'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN address_state VARCHAR(2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'address_zipcode'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN address_zipcode VARCHAR(10);
    END IF;

    -- Contato de emergência
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'emergency_contact_name'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN emergency_contact_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'emergency_contact_phone'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN emergency_contact_phone VARCHAR(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'emergency_contact_relationship'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN emergency_contact_relationship VARCHAR(100);
    END IF;
END $$;

-- Índices para busca por telefone
CREATE INDEX IF NOT EXISTS idx_stakeholders_phone ON stakeholders(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stakeholders_whatsapp ON stakeholders(whatsapp) WHERE whatsapp IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN stakeholders.phone IS 'Telefone celular principal do morador/proprietário';
COMMENT ON COLUMN stakeholders.phone_secondary IS 'Telefone secundário ou fixo';
COMMENT ON COLUMN stakeholders.whatsapp IS 'Número do WhatsApp (pode ser igual ao phone)';
COMMENT ON COLUMN stakeholders.has_whatsapp IS 'Indica se o telefone principal tem WhatsApp';
COMMENT ON COLUMN stakeholders.address_street IS 'Endereço do morador/proprietário (se diferente da unidade)';
COMMENT ON COLUMN stakeholders.emergency_contact_name IS 'Nome do contato de emergência';
COMMENT ON COLUMN stakeholders.emergency_contact_phone IS 'Telefone do contato de emergência';
COMMENT ON COLUMN stakeholders.emergency_contact_relationship IS 'Relação com o contato de emergência (pai, mãe, cônjuge, etc.)';

