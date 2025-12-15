# ✅ Aplicar Migration 047 - Mono-Tenant

## 🎯 Projeto: obyrjbhomqtepebykavb

## 📋 Passo a Passo Rápido

### 1. Acesse o Supabase Dashboard
👉 https://supabase.com/dashboard/project/obyrjbhomqtepebykavb

### 2. Vá em SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Cole o SQL
Copie TODO o conteúdo do arquivo `MIGRATION_047_APLICAR_AGORA.sql` e cole no editor.

### 4. Execute
- Clique em **Run** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

### 5. Verifique
Execute esta query para confirmar que foi aplicada:

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

Você deve ver:
- ✅ 1 função: `check_single_active_condominium`
- ✅ 1 trigger: `enforce_single_active_condominium`

## 🧪 Teste

Após aplicar, teste se está funcionando:

```sql
-- Este comando deve FALHAR se já houver um condomínio ativo
INSERT INTO condominiums (name, is_active) 
VALUES ('Teste Segundo Condomínio', true);
```

**Resultado esperado**: Erro informando que apenas um condomínio pode estar ativo.

## ✅ Pronto!

Após aplicar a migration, a aplicação estará configurada como mono-tenant.

