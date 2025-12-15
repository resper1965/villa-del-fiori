-- Migration: Índices Estratégicos para Performance
-- Descrição: Adiciona índices para otimizar queries frequentes
-- Data: 2025-01-15

-- ============================================
-- ÍNDICES PARA PROCESSOS
-- ============================================

-- Índice para busca por status (muito usado em approvals)
CREATE INDEX IF NOT EXISTS idx_processes_status 
ON processes(status);

-- Índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_processes_category 
ON processes(category);

-- Índice composto para status + categoria (usado em filtros combinados)
CREATE INDEX IF NOT EXISTS idx_processes_status_category 
ON processes(status, category);

-- Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_processes_created_at 
ON processes(created_at DESC);

-- ============================================
-- ÍNDICES PARA PROCESS_VERSIONS
-- ============================================

-- Índice para buscar versões por processo
CREATE INDEX IF NOT EXISTS idx_process_versions_process_id 
ON process_versions(process_id);

-- Índice para buscar versão atual (usando current_version_number da tabela processes)
-- Nota: is_current não existe, versão atual é determinada por current_version_number em processes
CREATE INDEX IF NOT EXISTS idx_process_versions_version_number 
ON process_versions(process_id, version_number DESC);

-- ============================================
-- ÍNDICES PARA APPROVALS
-- ============================================

-- Índice para buscar aprovações por processo
CREATE INDEX IF NOT EXISTS idx_approvals_process_id 
ON approvals(process_id);

-- Índice para buscar aprovações por versão
CREATE INDEX IF NOT EXISTS idx_approvals_version_id 
ON approvals(version_id);

-- Índice para buscar aprovações por stakeholder
CREATE INDEX IF NOT EXISTS idx_approvals_stakeholder_id 
ON approvals(stakeholder_id);

-- ============================================
-- ÍNDICES PARA REJECTIONS
-- ============================================

-- Índice para buscar rejeições por processo
CREATE INDEX IF NOT EXISTS idx_rejections_process_id 
ON rejections(process_id);

-- Índice para buscar rejeições por versão
CREATE INDEX IF NOT EXISTS idx_rejections_version_id 
ON rejections(version_id);

-- ============================================
-- ÍNDICES PARA NOTIFICATIONS
-- ============================================

-- Índice composto para buscar notificações não lidas por usuário
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC) 
WHERE is_read = false;

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON notifications(created_at DESC);

-- ============================================
-- ÍNDICES PARA UNITS
-- ============================================
-- Nota: units não tem condominium_id (sistema mono-tenant)

-- Índice para busca por número de unidade
CREATE INDEX IF NOT EXISTS idx_units_number 
ON units(number) 
WHERE is_active = true;

-- ============================================
-- ÍNDICES PARA VEHICLES
-- ============================================

-- Índice para busca por placa (normalizada)
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate 
ON vehicles(license_plate) 
WHERE is_active = true;

-- Índice para buscar veículos por unidade
CREATE INDEX IF NOT EXISTS idx_vehicles_unit_id 
ON vehicles(unit_id) 
WHERE is_active = true;

-- ============================================
-- ÍNDICES PARA STAKEHOLDERS
-- ============================================

-- Índice para buscar stakeholders por unidade
CREATE INDEX IF NOT EXISTS idx_stakeholders_unit_id 
ON stakeholders(unit_id) 
WHERE is_active = true;

-- Índice para buscar stakeholders por auth_user_id
CREATE INDEX IF NOT EXISTS idx_stakeholders_auth_user_id 
ON stakeholders(auth_user_id) 
WHERE is_active = true;

-- ============================================
-- ÍNDICES PARA ENTITIES
-- ============================================

-- Índice para busca por tipo
CREATE INDEX IF NOT EXISTS idx_entities_type 
ON entities(type) 
WHERE is_active = true;

-- Índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_entities_category 
ON entities(category) 
WHERE is_active = true;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON INDEX idx_processes_status IS 'Otimiza busca de processos por status (usado em approvals)';
COMMENT ON INDEX idx_processes_category IS 'Otimiza busca de processos por categoria';
COMMENT ON INDEX idx_processes_status_category IS 'Otimiza filtros combinados de status e categoria';
COMMENT ON INDEX idx_processes_name_trgm IS 'Otimiza busca de texto por nome (requer extensão pg_trgm)';
COMMENT ON INDEX idx_notifications_user_unread IS 'Otimiza busca de notificações não lidas por usuário';
COMMENT ON INDEX idx_vehicles_license_plate IS 'Otimiza busca de veículos por placa';

