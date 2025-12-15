-- Migration: Optimize RLS Policies
-- Data: 2025-01-15
-- Descrição: Otimizar políticas RLS para usar (select auth.uid()) em vez de auth.uid()

-- Chat Conversations Policies
DROP POLICY IF EXISTS "chat_conversations_select_own" ON chat_conversations;
CREATE POLICY "chat_conversations_select_own"
ON chat_conversations
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "chat_conversations_insert_own" ON chat_conversations;
CREATE POLICY "chat_conversations_insert_own"
ON chat_conversations
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "chat_conversations_update_own" ON chat_conversations;
CREATE POLICY "chat_conversations_update_own"
ON chat_conversations
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "chat_conversations_delete_own" ON chat_conversations;
CREATE POLICY "chat_conversations_delete_own"
ON chat_conversations
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Chat Messages Policies
DROP POLICY IF EXISTS "chat_messages_select_own" ON chat_messages;
CREATE POLICY "chat_messages_select_own"
ON chat_messages
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "chat_messages_insert_own" ON chat_messages;
CREATE POLICY "chat_messages_insert_own"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "chat_messages_delete_own" ON chat_messages;
CREATE POLICY "chat_messages_delete_own"
ON chat_messages
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Stakeholders Policies
DROP POLICY IF EXISTS "Users can update own stakeholder" ON stakeholders;
CREATE POLICY "Users can update own stakeholder"
ON stakeholders
FOR UPDATE
TO authenticated
USING (auth_user_id = (SELECT auth.uid()))
WITH CHECK (auth_user_id = (SELECT auth.uid()));

-- Processes Policies
DROP POLICY IF EXISTS "Users can create processes" ON processes;
CREATE POLICY "Users can create processes"
ON processes
FOR INSERT
TO authenticated
WITH CHECK (
  creator_id IN (
    SELECT id FROM stakeholders WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Process Versions Policies
DROP POLICY IF EXISTS "Users can create versions" ON process_versions;
CREATE POLICY "Users can create versions"
ON process_versions
FOR INSERT
TO authenticated
WITH CHECK (
  created_by IN (
    SELECT id FROM stakeholders WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Approvals Policies
DROP POLICY IF EXISTS "Users can create own approvals" ON approvals;
CREATE POLICY "Users can create own approvals"
ON approvals
FOR INSERT
TO authenticated
WITH CHECK (
  stakeholder_id IN (
    SELECT id FROM stakeholders WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Rejections Policies
DROP POLICY IF EXISTS "Users can create own rejections" ON rejections;
CREATE POLICY "Users can create own rejections"
ON rejections
FOR INSERT
TO authenticated
WITH CHECK (
  stakeholder_id IN (
    SELECT id FROM stakeholders WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Entities Policies
DROP POLICY IF EXISTS "Authenticated users can view entities" ON entities;
CREATE POLICY "Authenticated users can view entities"
ON entities
FOR SELECT
TO authenticated
USING (true);

-- Validation Results Policies
DROP POLICY IF EXISTS "Authenticated users can view validation results" ON validation_results;
CREATE POLICY "Authenticated users can view validation results"
ON validation_results
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create validation results" ON validation_results;
CREATE POLICY "Users can create validation results"
ON validation_results
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update validation results" ON validation_results;
CREATE POLICY "Users can update validation results"
ON validation_results
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Condominiums Policies
DROP POLICY IF EXISTS "Usuários podem atualizar seus condomínios" ON condominiums;
CREATE POLICY "Usuários podem atualizar seus condomínios"
ON condominiums
FOR UPDATE
TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Apenas admins podem deletar condomínios" ON condominiums;
CREATE POLICY "Apenas admins podem deletar condomínios"
ON condominiums
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stakeholders
    WHERE auth_user_id = (SELECT auth.uid())
    AND user_role = 'admin'
    AND is_active = true
  )
);

