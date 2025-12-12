-- Migration: Adicionar campos de funcionário e cargo em stakeholders
-- Descrição: Adiciona campos para identificar funcionários do condomínio e cargos (síndico, subsíndico, conselheiro)

DO $$
BEGIN
    -- Cargo no condomínio (se aplicável)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'condominium_role'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN condominium_role VARCHAR(50); -- 'syndic', 'subsindico', 'council', NULL
    END IF;

    -- Funcionário (se for funcionário do condomínio)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'is_employee'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN is_employee BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'employee_role'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN employee_role VARCHAR(100); -- 'porteiro', 'zelador', 'faxineiro', etc.
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholders' 
        AND column_name = 'employee_unit_id'
    ) THEN
        ALTER TABLE stakeholders 
        ADD COLUMN employee_unit_id UUID REFERENCES units(id) ON DELETE SET NULL; -- Unidade onde trabalha
        
        CREATE INDEX IF NOT EXISTS idx_stakeholders_employee_unit_id ON stakeholders(employee_unit_id) WHERE employee_unit_id IS NOT NULL;
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_stakeholders_condominium_role ON stakeholders(condominium_role) WHERE condominium_role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stakeholders_is_employee ON stakeholders(is_employee) WHERE is_employee = true;
CREATE INDEX IF NOT EXISTS idx_stakeholders_employee_role ON stakeholders(employee_role) WHERE employee_role IS NOT NULL;

-- Comentários
COMMENT ON COLUMN stakeholders.condominium_role IS 'Cargo no condomínio (syndic, subsindico, council) - qualificação do morador/proprietário';
COMMENT ON COLUMN stakeholders.is_employee IS 'Indica se é funcionário do condomínio';
COMMENT ON COLUMN stakeholders.employee_role IS 'Função do funcionário (porteiro, zelador, faxineiro, etc.)';
COMMENT ON COLUMN stakeholders.employee_unit_id IS 'Unidade onde o funcionário trabalha (se aplicável)';



