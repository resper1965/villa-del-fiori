-- Migration: RLS Policies para novas tabelas
-- Descrição: Implementa Row Level Security para condominiums, pets e suppliers

-- ============================================
-- CONDOMÍNIOS
-- ============================================

ALTER TABLE condominiums ENABLE ROW LEVEL SECURITY;

-- Policy: Todos os usuários autenticados podem visualizar condomínios ativos
CREATE POLICY "Usuários autenticados podem visualizar condomínios ativos"
ON condominiums
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Apenas admin/síndico/subsíndico podem criar condomínios
CREATE POLICY "Apenas admin/síndico/subsíndico podem criar condomínios"
ON condominiums
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas admin/síndico/subsíndico podem atualizar condomínios
CREATE POLICY "Apenas admin/síndico/subsíndico podem atualizar condomínios"
ON condominiums
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas administradores podem deletar condomínios
CREATE POLICY "Apenas admin pode deletar condomínios"
ON condominiums
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text = 'admin'
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- ============================================
-- PETS
-- ============================================

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem visualizar pets ativos
CREATE POLICY "Usuários autenticados podem visualizar pets ativos"
ON pets
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Usuários autenticados podem criar pets
CREATE POLICY "Usuários autenticados podem criar pets"
ON pets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico', 'resident')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas admin/síndico/subsíndico podem atualizar pets
CREATE POLICY "Apenas admin/síndico/subsíndico podem atualizar pets"
ON pets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas admin/síndico/subsíndico podem deletar pets
CREATE POLICY "Apenas admin/síndico/subsíndico podem deletar pets"
ON pets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- ============================================
-- FORNECEDORES
-- ============================================

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem visualizar fornecedores ativos
CREATE POLICY "Usuários autenticados podem visualizar fornecedores ativos"
ON suppliers
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Apenas admin/síndico/subsíndico podem criar fornecedores
CREATE POLICY "Apenas admin/síndico/subsíndico podem criar fornecedores"
ON suppliers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas admin/síndico/subsíndico podem atualizar fornecedores
CREATE POLICY "Apenas admin/síndico/subsíndico podem atualizar fornecedores"
ON suppliers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas administradores podem deletar fornecedores
CREATE POLICY "Apenas admin pode deletar fornecedores"
ON suppliers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text = 'admin'
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

