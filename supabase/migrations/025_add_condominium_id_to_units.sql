-- Migration: Adicionar condominium_id em units
-- Descrição: Relaciona unidades com condomínios

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'units' 
        AND column_name = 'condominium_id'
    ) THEN
        ALTER TABLE units 
        ADD COLUMN condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_units_condominium_id ON units(condominium_id);
    END IF;
END $$;

COMMENT ON COLUMN units.condominium_id IS 'Condomínio ao qual a unidade pertence';



