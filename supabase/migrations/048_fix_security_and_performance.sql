-- Migration: Correções de Segurança e Performance
-- Descrição: Corrige problemas identificados pelos advisors do Supabase
-- Data: 2025-01-15

-- ============================================
-- 1. CORREÇÕES DE SEGURANÇA: Search Path nas Funções
-- ============================================

-- Função: normalize_license_plate
CREATE OR REPLACE FUNCTION normalize_license_plate(plate TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN UPPER(REPLACE(REPLACE(plate, ' ', ''), '-', ''));
END;
$$;

-- Função: normalize_vehicle_license_plate
CREATE OR REPLACE FUNCTION normalize_vehicle_license_plate()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.license_plate = normalize_license_plate(NEW.license_plate);
    RETURN NEW;
END;
$$;

-- Função: check_single_active_condominium (já criada, mas sem search_path)
CREATE OR REPLACE FUNCTION check_single_active_condominium()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Se estamos ativando um condomínio (is_active = true)
  IF NEW.is_active = true THEN
    -- Verificar se já existe outro condomínio ativo
    IF EXISTS (
      SELECT 1 FROM condominiums 
      WHERE is_active = true 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Apenas um condomínio pode estar ativo por vez. A aplicação é mono-tenant.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Nota: get_next_version_number já foi corrigida na migration 043

-- ============================================
-- 2. OTIMIZAÇÕES DE PERFORMANCE: RLS Policies
-- ============================================

-- UNITS: Otimizar políticas usando (select auth.uid())
DROP POLICY IF EXISTS "Apenas admin/síndico/subsíndico podem criar unidades" ON units;
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

DROP POLICY IF EXISTS "Apenas admin/síndico/subsíndico podem atualizar unidades" ON units;
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

DROP POLICY IF EXISTS "Apenas admin pode deletar unidades" ON units;
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

-- VEHICLES: Otimizar políticas usando (select auth.uid())
DROP POLICY IF EXISTS "Usuários podem criar veículos para sua unidade" ON vehicles;
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
  OR
  -- Ou o veículo está associado à unidade do usuário
  EXISTS (
    SELECT 1 FROM stakeholders
    WHERE stakeholders.auth_user_id = (select auth.uid())
    AND stakeholders.unit_id = vehicles.unit_id
    AND stakeholders.is_active = true
  )
);

DROP POLICY IF EXISTS "Usuários podem atualizar veículos de sua unidade" ON vehicles;
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
  OR
  -- Ou o veículo está associado à unidade do usuário
  EXISTS (
    SELECT 1 FROM stakeholders
    WHERE stakeholders.auth_user_id = (select auth.uid())
    AND stakeholders.unit_id = vehicles.unit_id
    AND stakeholders.is_active = true
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
  OR
  -- Ou o veículo está associado à unidade do usuário
  EXISTS (
    SELECT 1 FROM stakeholders
    WHERE stakeholders.auth_user_id = (select auth.uid())
    AND stakeholders.unit_id = vehicles.unit_id
    AND stakeholders.is_active = true
  )
);

DROP POLICY IF EXISTS "Apenas admin/síndico/subsíndico podem deletar veículos" ON vehicles;
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

-- Nota: As políticas de condominiums, pets e suppliers já estão otimizadas na migration 030
-- (já usam (select auth.uid()))

-- ============================================
-- 3. CONSOLIDAÇÃO DE POLÍTICAS DUPLICADAS
-- ============================================

-- CONDOMINIUMS: Remover políticas duplicadas e manter apenas as corretas

-- DELETE: Remover "Apenas admins podem deletar condomínios" (duplicada)
-- Manter "Apenas admin pode deletar condomínios" (mais específica)
DROP POLICY IF EXISTS "Apenas admins podem deletar condomínios" ON condominiums;

-- INSERT: Remover "Usuários autenticados podem criar condomínios" (muito permissiva)
-- Manter "Apenas admin/síndico/subsíndico podem criar condomínios" (mais restritiva)
DROP POLICY IF EXISTS "Usuários autenticados podem criar condomínios" ON condominiums;

-- SELECT: Remover "Usuários autenticados podem ver condomínios ativos" (duplicada)
-- Manter "Usuários autenticados podem visualizar condomínios ativos" (nome mais completo)
DROP POLICY IF EXISTS "Usuários autenticados podem ver condomínios ativos" ON condominiums;

-- UPDATE: Remover "Usuários podem atualizar seus condomínios" (não faz sentido em mono-tenant)
-- Manter "Apenas admin/síndico/subsíndico podem atualizar condomínios" (mais restritiva)
DROP POLICY IF EXISTS "Usuários podem atualizar seus condomínios" ON condominiums;

-- ENTITIES: Remover política SELECT duplicada
-- A política "Admins and syndics can manage entities" (ALL) já cobre SELECT
-- A política "Authenticated users can view entities" (SELECT) é redundante
DROP POLICY IF EXISTS "Authenticated users can view entities" ON entities;

-- Comentários
COMMENT ON FUNCTION normalize_license_plate IS 'Normaliza placa de veículo (maiúsculas, sem espaços/hífens) - search_path fixo para segurança';
COMMENT ON FUNCTION normalize_vehicle_license_plate IS 'Trigger function para normalizar placa - search_path fixo para segurança';
COMMENT ON FUNCTION check_single_active_condominium IS 'Garante que apenas um condomínio possa estar ativo por vez (mono-tenant) - search_path fixo para segurança';

