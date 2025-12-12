-- Migration: RLS Policies para Unidades e Veículos
-- Descrição: Adiciona Row Level Security policies para as tabelas units e vehicles

-- Habilitar RLS nas tabelas
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES PARA UNIDADES (units)
-- ============================================

-- Policy: Usuários autenticados podem visualizar unidades ativas
CREATE POLICY "Usuários autenticados podem visualizar unidades ativas"
ON units
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Apenas administradores, síndicos e subsíndicos podem inserir unidades
CREATE POLICY "Apenas admin/síndico/subsíndico podem criar unidades"
ON units
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas administradores, síndicos e subsíndicos podem atualizar unidades
CREATE POLICY "Apenas admin/síndico/subsíndico podem atualizar unidades"
ON units
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas administradores podem deletar unidades (soft delete)
CREATE POLICY "Apenas admin pode deletar unidades"
ON units
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text = 'admin'
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- ============================================
-- POLICIES PARA VEÍCULOS (vehicles)
-- ============================================

-- Policy: Usuários autenticados podem visualizar veículos ativos
CREATE POLICY "Usuários autenticados podem visualizar veículos ativos"
ON vehicles
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Usuários autenticados podem inserir veículos (associados à sua unidade ou como admin)
CREATE POLICY "Usuários podem criar veículos para sua unidade"
ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Admin, síndico ou subsíndico podem criar qualquer veículo
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
  OR
  -- Ou o veículo está associado à unidade do usuário
  EXISTS (
    SELECT 1 FROM stakeholders
    WHERE stakeholders.auth_user_id = auth.uid()
    AND stakeholders.unit_id = vehicles.unit_id
    AND stakeholders.is_active = true
  )
);

-- Policy: Usuários podem atualizar veículos de sua unidade ou admin pode atualizar qualquer um
CREATE POLICY "Usuários podem atualizar veículos de sua unidade"
ON vehicles
FOR UPDATE
TO authenticated
USING (
  -- Admin, síndico ou subsíndico podem atualizar qualquer veículo
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
  OR
  -- Ou o veículo está associado à unidade do usuário
  EXISTS (
    SELECT 1 FROM stakeholders
    WHERE stakeholders.auth_user_id = auth.uid()
    AND stakeholders.unit_id = vehicles.unit_id
    AND stakeholders.is_active = true
  )
)
WITH CHECK (
  -- Admin, síndico ou subsíndico podem atualizar qualquer veículo
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
  OR
  -- Ou o veículo está associado à unidade do usuário
  EXISTS (
    SELECT 1 FROM stakeholders
    WHERE stakeholders.auth_user_id = auth.uid()
    AND stakeholders.unit_id = vehicles.unit_id
    AND stakeholders.is_active = true
  )
);

-- Policy: Apenas administradores, síndicos e subsíndicos podem deletar veículos
CREATE POLICY "Apenas admin/síndico/subsíndico podem deletar veículos"
ON vehicles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Comentários para documentação
COMMENT ON POLICY "Usuários autenticados podem visualizar unidades ativas" ON units IS 
'Permite que todos os usuários autenticados visualizem unidades ativas';

COMMENT ON POLICY "Apenas admin/síndico/subsíndico podem criar unidades" ON units IS 
'Restringe criação de unidades apenas para administradores, síndicos e subsíndicos';

COMMENT ON POLICY "Apenas admin/síndico/subsíndico podem atualizar unidades" ON units IS 
'Restringe atualização de unidades apenas para administradores, síndicos e subsíndicos';

COMMENT ON POLICY "Apenas admin pode deletar unidades" ON units IS 
'Restringe exclusão de unidades apenas para administradores';

COMMENT ON POLICY "Usuários autenticados podem visualizar veículos ativos" ON vehicles IS 
'Permite que todos os usuários autenticados visualizem veículos ativos';

COMMENT ON POLICY "Usuários podem criar veículos para sua unidade" ON vehicles IS 
'Permite que usuários criem veículos associados à sua unidade, ou admin/síndico/subsíndico criem qualquer veículo';

COMMENT ON POLICY "Usuários podem atualizar veículos de sua unidade" ON vehicles IS 
'Permite que usuários atualizem veículos associados à sua unidade, ou admin/síndico/subsíndico atualizem qualquer veículo';

COMMENT ON POLICY "Apenas admin/síndico/subsíndico podem deletar veículos" ON vehicles IS 
'Restringe exclusão de veículos apenas para administradores, síndicos e subsíndicos';

