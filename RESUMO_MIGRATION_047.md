# 📋 Resumo: Migration 047 - Mono-Tenant

## ❌ Status: MCP Supabase não disponível

Infelizmente, **não há servidor MCP do Supabase configurado** no ambiente atual. 

## ✅ Alternativas para Aplicar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado) ⭐

1. **Acesse**: https://supabase.com/dashboard/project/obyrjbhomqtepebykavb/sql
2. **Clique em**: "New Query"
3. **Cole o SQL abaixo** e execute:

```sql
-- Migration: Garantir apenas um condomínio ativo (mono-tenant)
CREATE OR REPLACE FUNCTION check_single_active_condominium()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
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

DROP TRIGGER IF EXISTS enforce_single_active_condominium ON condominiums;
CREATE TRIGGER enforce_single_active_condominium
  BEFORE INSERT OR UPDATE ON condominiums
  FOR EACH ROW
  EXECUTE FUNCTION check_single_active_condominium();

COMMENT ON FUNCTION check_single_active_condominium() IS 'Garante que apenas um condomínio possa estar ativo por vez (mono-tenant)';
```

### Opção 2: Via Supabase CLI

```bash
cd /home/resper/villadelfiori
supabase link --project-ref obyrjbhomqtepebykavb
supabase db push
```

**Nota**: Pode requerer permissões específicas.

### Opção 3: Configurar MCP Supabase (Futuro)

Para usar MCP no futuro, seria necessário:
1. Instalar o servidor MCP do Supabase
2. Configurar credenciais
3. Conectar ao projeto

## 📁 Arquivos Criados

- ✅ `supabase/migrations/047_enforce_single_condominium.sql` - Migration
- ✅ `MIGRATION_047_APLICAR_AGORA.sql` - SQL pronto para copiar
- ✅ `APLICAR_MIGRATION_047_FINAL.md` - Instruções completas

## ✅ O que a Migration Faz

1. Cria função `check_single_active_condominium()`
2. Cria trigger `enforce_single_active_condominium`
3. Garante que apenas 1 condomínio possa estar ativo por vez
4. Bloqueia criação/ativação de múltiplos condomínios

## 🧪 Verificação

Após aplicar, execute:

```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'check_single_active_condominium';
```

Deve retornar 1 linha.

