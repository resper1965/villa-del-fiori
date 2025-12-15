# 🔧 Aplicar Migration 047 via MCP Supabase

## ✅ Status: MCP Configurado

O servidor MCP do Supabase **está configurado** para o projeto `obyrjbhomqtepebykavb` (Sindico Virtual), mas as **ferramentas não estão disponíveis** no momento.

## 📋 Solução: Aplicar via Supabase Dashboard

Como o MCP não está expondo ferramentas, a melhor opção é aplicar via **Supabase Dashboard**:

### Passo a Passo:

1. **Acesse**: https://supabase.com/dashboard/project/obyrjbhomqtepebykavb/sql

2. **Clique em**: "New Query"

3. **Cole o SQL completo**:

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

4. **Execute**: Clique em "Run" ou pressione `Ctrl+Enter`

### ✅ Verificação

```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'check_single_active_condominium';
```

Deve retornar 1 linha.

## 🔄 Alternativa: Supabase CLI

Se preferir usar CLI:

```bash
cd /home/resper/villadelfiori
supabase link --project-ref obyrjbhomqtepebykavb
supabase db push
```

## 📝 Nota sobre MCP

O MCP do Supabase está configurado mas não está expondo ferramentas para execução de SQL. Isso pode ser:
- Limitação da versão atual do MCP Supabase
- Necessidade de autenticação adicional
- Configuração específica necessária

Para o momento, usar o Dashboard é a forma mais confiável.

