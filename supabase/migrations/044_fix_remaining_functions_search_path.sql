-- Migration: Fix Remaining Functions Search Path
-- Data: 2025-01-15
-- Descrição: Adicionar SET search_path fixo em todas as funções SECURITY DEFINER restantes

-- Função: create_notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type notificationtype,
  p_title character varying,
  p_message text,
  p_process_id uuid DEFAULT NULL::uuid,
  p_stakeholder_id uuid DEFAULT NULL::uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    process_id,
    stakeholder_id,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_process_id,
    p_stakeholder_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Função: get_current_stakeholder
CREATE OR REPLACE FUNCTION get_current_stakeholder()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN (
        SELECT id FROM stakeholders
        WHERE auth_user_id = (SELECT auth.uid())
        LIMIT 1
    );
END;
$$;

-- Função: get_entity_integrity_metrics
CREATE OR REPLACE FUNCTION get_entity_integrity_metrics()
RETURNS TABLE(
  total_entities integer,
  complete_entities integer,
  incomplete_entities integer,
  total_processes integer,
  processes_with_valid_entities integer,
  processes_with_invalid_entities integer,
  orphaned_entities integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  total_entities_count INTEGER;
  complete_entities_count INTEGER;
  incomplete_entities_count INTEGER;
  total_processes_count INTEGER;
  valid_processes_count INTEGER;
  invalid_processes_count INTEGER;
  orphaned_entities_count INTEGER;
BEGIN
  -- Total de entidades ativas
  SELECT COUNT(*) INTO total_entities_count
  FROM entities
  WHERE is_active = true;

  -- Entidades completas (têm pelo menos phone ou email)
  SELECT COUNT(*) INTO complete_entities_count
  FROM entities
  WHERE is_active = true
    AND (phone IS NOT NULL AND phone != '' OR email IS NOT NULL AND email != '');

  -- Entidades incompletas
  incomplete_entities_count := total_entities_count - complete_entities_count;

  -- Total de processos
  SELECT COUNT(*) INTO total_processes_count
  FROM processes
  WHERE status != 'deletado';

  -- Processos com entidades válidas (todos existem e estão completas)
  SELECT COUNT(DISTINCT process_id) INTO valid_processes_count
  FROM validate_all_processes_entities()
  WHERE entity_exists = true AND is_complete = true;

  -- Processos com problemas (alguma entidade inválida)
  SELECT COUNT(DISTINCT process_id) INTO invalid_processes_count
  FROM validate_all_processes_entities()
  WHERE entity_exists = false OR is_complete = false;

  -- Entidades órfãs (não referenciadas por nenhum processo)
  SELECT COUNT(*) INTO orphaned_entities_count
  FROM entities e
  WHERE e.is_active = true
    AND NOT EXISTS (
      SELECT 1
      FROM validate_all_processes_entities() v
      WHERE v.entity_id = e.id
    );

  RETURN QUERY SELECT 
    total_entities_count,
    complete_entities_count,
    incomplete_entities_count,
    total_processes_count,
    valid_processes_count,
    invalid_processes_count,
    orphaned_entities_count;
END;
$$;

-- Função: get_stakeholder_user_id
CREATE OR REPLACE FUNCTION get_stakeholder_user_id(p_stakeholder_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT auth_user_id INTO v_user_id
  FROM stakeholders
  WHERE id = p_stakeholder_id;
  
  RETURN v_user_id;
END;
$$;

-- Função: get_unread_notifications_count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false;
  
  RETURN v_count;
END;
$$;

-- Função: handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    new_stakeholder_id UUID;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Get email and name from auth.users metadata or email
    user_email := NEW.email;
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1));
    
    -- Create stakeholder record
    INSERT INTO stakeholders (
        auth_user_id,
        email,
        name,
        type,
        role,
        user_role,
        is_active
    ) VALUES (
        NEW.id,
        user_email,
        user_name,
        'morador'::stakeholdertype,
        'visualizador'::stakeholderrole,
        'resident'::userrole,
        true
    )
    RETURNING id INTO new_stakeholder_id;
    
    RETURN NEW;
END;
$$;

-- Função: handle_user_delete
CREATE OR REPLACE FUNCTION handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Delete stakeholder (CASCADE will handle related records)
    DELETE FROM stakeholders
    WHERE auth_user_id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Função: handle_user_update
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Update email if changed
    UPDATE stakeholders
    SET 
        email = NEW.email,
        updated_at = now()
    WHERE auth_user_id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Função: has_role
CREATE OR REPLACE FUNCTION has_role(required_role userrole)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM stakeholders
        WHERE auth_user_id = (SELECT auth.uid())
        AND user_role = required_role
        AND is_active = true
    );
END;
$$;

-- Função: is_admin_or_syndic
CREATE OR REPLACE FUNCTION is_admin_or_syndic()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM stakeholders
        WHERE auth_user_id = (SELECT auth.uid())
        AND user_role IN ('admin', 'syndic')
        AND is_active = true
    );
END;
$$;

-- Função: mark_all_notifications_read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true,
      read_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função: mark_notification_read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true,
      read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função: notify_process_approved
CREATE OR REPLACE FUNCTION notify_process_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_process_name VARCHAR(255);
  v_creator_user_id UUID;
  v_approver_user_id UUID;
  v_approver_name VARCHAR(255);
BEGIN
  -- Buscar informações do processo
  SELECT p.name, p.creator_id INTO v_process_name, v_creator_user_id
  FROM processes p
  WHERE p.id = NEW.process_id;
  
  -- Buscar informações do aprovador
  SELECT s.auth_user_id, s.name INTO v_approver_user_id, v_approver_name
  FROM stakeholders s
  WHERE s.id = NEW.stakeholder_id;
  
  -- Notificar criador
  IF v_creator_user_id IS NOT NULL THEN
    PERFORM create_notification(
      v_creator_user_id,
      'approved',
      'Processo aprovado',
      format('O processo "%s" foi aprovado por %s.', v_process_name, COALESCE(v_approver_name, 'um aprovador')),
      NEW.process_id,
      NEW.stakeholder_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função: notify_process_rejected
CREATE OR REPLACE FUNCTION notify_process_rejected()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_process_name VARCHAR(255);
  v_creator_user_id UUID;
  v_rejector_user_id UUID;
  v_rejector_name VARCHAR(255);
BEGIN
  -- Buscar informações do processo
  SELECT p.name, p.creator_id INTO v_process_name, v_creator_user_id
  FROM processes p
  WHERE p.id = NEW.process_id;
  
  -- Buscar informações do rejeitador
  SELECT s.auth_user_id, s.name INTO v_rejector_user_id, v_rejector_name
  FROM stakeholders s
  WHERE s.id = NEW.stakeholder_id;
  
  -- Notificar criador
  IF v_creator_user_id IS NOT NULL THEN
    PERFORM create_notification(
      v_creator_user_id,
      'rejected',
      'Processo rejeitado',
      format('O processo "%s" foi rejeitado por %s. Motivo: %s', 
        v_process_name, 
        COALESCE(v_rejector_name, 'um revisor'),
        COALESCE(NEW.reason, 'Não informado')
      ),
      NEW.process_id,
      NEW.stakeholder_id,
      jsonb_build_object('reason', NEW.reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função: notify_process_status_approved
CREATE OR REPLACE FUNCTION notify_process_status_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_creator_user_id UUID;
BEGIN
  -- Apenas quando status muda para 'aprovado'
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    -- Buscar user_id do criador
    SELECT auth_user_id INTO v_creator_user_id
    FROM stakeholders
    WHERE id = NEW.creator_id;
    
    -- Notificar criador
    IF v_creator_user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_creator_user_id,
        'approved',
        'Processo totalmente aprovado',
        format('O processo "%s" foi totalmente aprovado e está disponível na base de conhecimento.', NEW.name),
        NEW.id,
        NEW.creator_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função: notify_process_submitted_for_review
CREATE OR REPLACE FUNCTION notify_process_submitted_for_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_process_name VARCHAR(255);
  v_creator_user_id UUID;
  v_stakeholder RECORD;
BEGIN
  -- Buscar nome do processo
  SELECT name INTO v_process_name
  FROM processes
  WHERE id = NEW.process_id;
  
  -- Buscar user_id do criador
  SELECT auth_user_id INTO v_creator_user_id
  FROM stakeholders
  WHERE id = (SELECT creator_id FROM processes WHERE id = NEW.process_id);
  
  -- Notificar criador
  IF v_creator_user_id IS NOT NULL THEN
    PERFORM create_notification(
      v_creator_user_id,
      'process_refactored',
      'Processo enviado para revisão',
      format('O processo "%s" foi enviado para revisão.', v_process_name),
      NEW.process_id,
      (SELECT creator_id FROM processes WHERE id = NEW.process_id)
    );
  END IF;
  
  -- Notificar stakeholders que podem aprovar (aprovadores)
  FOR v_stakeholder IN
    SELECT DISTINCT s.id, s.auth_user_id
    FROM stakeholders s
    WHERE s.role = 'aprovador'
      AND s.is_active = true
      AND s.auth_user_id IS NOT NULL
  LOOP
    IF v_stakeholder.auth_user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_stakeholder.auth_user_id,
        'approval_pending',
        'Processo pendente de aprovação',
        format('O processo "%s" está aguardando sua aprovação.', v_process_name),
        NEW.process_id,
        v_stakeholder.id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Função: sync_user_app_metadata
CREATE OR REPLACE FUNCTION sync_user_app_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_app_metadata jsonb;
BEGIN
  -- Construir app_metadata baseado nos campos do stakeholder
  v_app_metadata := jsonb_build_object(
    'user_role', COALESCE(NEW.user_role, 'resident'),
    'is_approved', COALESCE(NEW.is_approved, false),
    'approved_at', NEW.approved_at,
    'approved_by', NEW.approved_by
  );

  -- Atualizar app_metadata do usuário no auth.users
  -- Nota: Isso requer permissões de service_role, então será feito via Edge Function
  -- Este trigger apenas prepara os dados
  
  RETURN NEW;
END;
$$;

-- Função: validate_all_processes_entities
CREATE OR REPLACE FUNCTION validate_all_processes_entities()
RETURNS TABLE(
  process_id uuid,
  process_name text,
  entity_name text,
  entity_exists boolean,
  is_complete boolean,
  missing_fields text[],
  entity_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  process_record RECORD;
BEGIN
  -- Para cada processo
  FOR process_record IN 
    SELECT id, name
    FROM processes
    WHERE status != 'deletado'
  LOOP
    -- Validar entidades do processo
    RETURN QUERY
    SELECT 
      v.process_id,
      v.process_name,
      v.entity_name,
      v.entity_exists,
      v.is_complete,
      v.missing_fields,
      v.entity_id
    FROM validate_process_entities_by_id(process_record.id) v;
  END LOOP;
END;
$$;

-- Função: validate_process_entities
CREATE OR REPLACE FUNCTION validate_process_entities(entity_names text[])
RETURNS TABLE(
  entity_name text,
  entity_exists boolean,
  is_complete boolean,
  missing_fields text[],
  entity_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  entity_name_item TEXT;
  entity_record RECORD;
  missing_fields_list TEXT[];
BEGIN
  -- Para cada nome de entidade fornecido
  FOREACH entity_name_item IN ARRAY entity_names
  LOOP
    -- Buscar entidade por nome (case-insensitive)
    SELECT 
      id,
      name,
      type,
      category,
      phone,
      email,
      contact_person,
      description,
      address,
      emergency_phone,
      meeting_point,
      cnpj,
      is_active
    INTO entity_record
    FROM entities
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(entity_name_item))
      AND is_active = true
    LIMIT 1;

    -- Se entidade não existe
    IF entity_record.id IS NULL THEN
      RETURN QUERY SELECT 
        entity_name_item::TEXT,
        false::BOOLEAN,
        false::BOOLEAN,
        ARRAY[]::TEXT[],
        NULL::UUID;
      CONTINUE;
    END IF;

    -- Verificar se entidade está completa
    missing_fields_list := ARRAY[]::TEXT[];

    -- Para empresas: CNPJ é recomendado
    IF entity_record.type = 'empresa' AND (entity_record.cnpj IS NULL OR entity_record.cnpj = '') THEN
      missing_fields_list := array_append(missing_fields_list, 'cnpj');
    END IF;

    -- Para serviços de emergência: telefone de emergência é recomendado
    IF entity_record.type = 'servico_emergencia' AND (entity_record.emergency_phone IS NULL OR entity_record.emergency_phone = '') THEN
      missing_fields_list := array_append(missing_fields_list, 'emergency_phone');
    END IF;

    -- Contato básico recomendado para todos (phone ou email)
    IF (entity_record.phone IS NULL OR entity_record.phone = '') 
       AND (entity_record.email IS NULL OR entity_record.email = '') THEN
      missing_fields_list := array_append(missing_fields_list, 'contact');
    END IF;

    -- Retornar resultado
    RETURN QUERY SELECT 
      entity_name_item::TEXT,
      true::BOOLEAN,
      (array_length(missing_fields_list, 1) IS NULL)::BOOLEAN,
      missing_fields_list,
      entity_record.id;
  END LOOP;
END;
$$;

-- Função: validate_process_entities_by_id
CREATE OR REPLACE FUNCTION validate_process_entities_by_id(p_process_id uuid)
RETURNS TABLE(
  entity_name text,
  entity_exists boolean,
  is_complete boolean,
  missing_fields text[],
  entity_id uuid,
  process_id uuid,
  process_name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  process_record RECORD;
  version_record RECORD;
  entity_names TEXT[];
BEGIN
  -- Buscar processo
  SELECT id, name, current_version_number
  INTO process_record
  FROM processes
  WHERE id = p_process_id;

  IF process_record.id IS NULL THEN
    RAISE EXCEPTION 'Processo não encontrado: %', p_process_id;
  END IF;

  -- Buscar versão atual
  SELECT content, entities_involved
  INTO version_record
  FROM process_versions
  WHERE process_id = p_process_id
    AND version_number = process_record.current_version_number
  ORDER BY created_at DESC
  LIMIT 1;

  -- Extrair entidades (pode estar em entities_involved ou content.entities)
  IF version_record.entities_involved IS NOT NULL AND jsonb_typeof(version_record.entities_involved) = 'array' THEN
    SELECT array_agg(value::TEXT)
    INTO entity_names
    FROM jsonb_array_elements_text(version_record.entities_involved);
  ELSIF version_record.content IS NOT NULL AND version_record.content ? 'entities' THEN
    IF jsonb_typeof(version_record.content->'entities') = 'array' THEN
      SELECT array_agg(value::TEXT)
      INTO entity_names
      FROM jsonb_array_elements_text(version_record.content->'entities');
    END IF;
  END IF;

  -- Se não há entidades, retornar vazio
  IF entity_names IS NULL OR array_length(entity_names, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Validar entidades
  RETURN QUERY
  SELECT 
    v.entity_name,
    v.entity_exists,
    v.is_complete,
    v.missing_fields,
    v.entity_id,
    process_record.id,
    process_record.name
  FROM validate_process_entities(entity_names) v;
END;
$$;

