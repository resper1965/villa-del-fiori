# ✅ Aplicar Migration 047 - Mono-Tenant

## 🎯 Projeto: obyrjbhomqtepebykavb

## 📋 SQL para Aplicar

Como a API REST do Supabase não permite executar SQL arbitrário diretamente, você precisa aplicar via **Supabase Dashboard**:

### Passo a Passo:

1. **Acesse o Dashboard**
   👉 https://supabase.com/dashboard/project/obyrjbhomqtepebykavb

2. **Vá em SQL Editor**
   - Menu lateral → **SQL Editor**
   - Clique em **New Query**

3. **Cole e Execute o SQL abaixo:**

```sql
-- Migration: Garantir apenas um condomínio ativo (mono-tenant)
-- Descrição: Adiciona constraint para garantir que apenas um condomínio possa estar ativo por vez

-- Função para verificar se já existe um condomínio ativo
CREATE OR REPLACE FUNCTION check_single_active_condominium()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger para INSERT e UPDATE
DROP TRIGGER IF EXISTS enforce_single_active_condominium ON condominiums;
CREATE TRIGGER enforce_single_active_condominium
  BEFORE INSERT OR UPDATE ON condominiums
  FOR EACH ROW
  EXECUTE FUNCTION check_single_active_condominium();

-- Comentário
COMMENT ON FUNCTION check_single_active_condominium() IS 'Garante que apenas um condomínio possa estar ativo por vez (mono-tenant)';
```

4. **Clique em Run** (ou `Ctrl+Enter` / `Cmd+Enter`)

### ✅ Verificação

Execute esta query para confirmar:

```sql
-- Verificar função
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'check_single_active_condominium';

-- Verificar trigger
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'enforce_single_active_condominium';
```

**Resultado esperado:**
- ✅ 1 função: `check_single_active_condominium`
- ✅ 1 trigger: `enforce_single_active_condominium`

### 🧪 Teste

```sql
-- Este comando deve FALHAR se já houver um condomínio ativo
INSERT INTO condominiums (name, is_active) 
VALUES ('Teste Segundo Condomínio', true);
```

**Resultado esperado:** Erro informando que apenas um condomínio pode estar ativo.

## ✅ Pronto!

Após aplicar, a aplicação estará configurada como mono-tenant.

