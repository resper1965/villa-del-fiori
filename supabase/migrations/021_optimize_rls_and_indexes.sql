-- Migration: Otimizar RLS Policies e Adicionar Índices
-- Descrição: Otimiza políticas RLS usando (select auth.uid()) e adiciona índices críticos

-- ============================================
-- OTIMIZAR POLÍTICAS RLS (usar (select auth.uid()) para evitar re-avaliação)
-- ============================================

-- Dropar e recriar políticas de units com otimização
DROP POLICY IF EXISTS "Apenas admin/síndico/subsíndico podem criar unidades" ON units;
DROP POLICY IF EXISTS "Apenas admin/síndico/subsíndico podem atualizar unidades" ON units;
DROP POLICY IF EXISTS "Apenas admin pode deletar unidades" ON units;

-- Policy: Apenas administradores, síndicos e subsíndicos podem inserir unidades (OTIMIZADO)
CREATE POLICY "Apenas admin/síndico/subsíndico podem criar unidades"
ON units
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

-- Policy: Apenas administradores, síndicos e subsíndicos podem atualizar unidades (OTIMIZADO)
CREATE POLICY "Apenas admin/síndico/subsíndico podem atualizar unidades"
ON units
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

-- Policy: Apenas administradores podem deletar unidades (OTIMIZADO)
CREATE POLICY "Apenas admin pode deletar unidades"
ON units
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

-- Dropar e recriar políticas de vehicles com otimização
DROP POLICY IF EXISTS "Usuários podem criar veículos para sua unidade" ON vehicles;
DROP POLICY IF EXISTS "Usuários podem atualizar veículos de sua unidade" ON vehicles;
DROP POLICY IF EXISTS "Apenas admin/síndico/subsíndico podem deletar veículos" ON vehicles;

-- Policy: Usuários autenticados podem inserir veículos (OTIMIZADO)
CREATE POLICY "Usuários podem criar veículos para sua unidade"
ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Admin, síndico ou subsíndico podem criar qualquer veículo
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Usuários podem atualizar veículos de sua unidade (OTIMIZADO)
CREATE POLICY "Usuários podem atualizar veículos de sua unidade"
ON vehicles
FOR UPDATE
TO authenticated
USING (
  -- Admin, síndico ou subsíndico podem atualizar qualquer veículo
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
  -- Admin, síndico ou subsíndico podem atualizar qualquer veículo
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (select auth.uid())
    AND (
      (auth.users.raw_app_meta_data->>'user_role')::text IN ('admin', 'syndic', 'subsindico')
      OR auth.users.id::text = current_setting('app.superadmin_uid', true)
    )
  )
);

-- Policy: Apenas administradores, síndicos e subsíndicos podem deletar veículos (OTIMIZADO)
CREATE POLICY "Apenas admin/síndico/subsíndico podem deletar veículos"
ON vehicles
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
-- ADICIONAR ÍNDICES CRÍTICOS
-- ============================================

-- Índice para stakeholders (usado nas políticas RLS e queries)
CREATE INDEX IF NOT EXISTS idx_stakeholders_unit_id ON stakeholders(unit_id) WHERE unit_id IS NOT NULL;

