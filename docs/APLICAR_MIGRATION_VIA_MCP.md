# Aplicar Migration 047 via MCP/CLI

## ⚠️ Status Atual

O projeto Supabase está **pausado**. Para aplicar a migration, você precisa:

1. **Despausar o projeto** no Supabase Dashboard
2. **Aplicar a migration** usando uma das opções abaixo

## Opção 1: Via Supabase CLI (Recomendado)

### Passo 1: Despausar o Projeto

1. Acesse: https://supabase.com/dashboard/project/hyplrlakowbwntkidtcp
2. Clique em "Resume" ou "Unpause" para ativar o projeto

### Passo 2: Linkar o Projeto (se necessário)

```bash
cd /home/resper/villadelfiori
supabase link --project-ref hyplrlakowbwntkidtcp
```

### Passo 3: Aplicar a Migration

```bash
# Aplicar todas as migrations pendentes (incluindo a 047)
supabase db push

# OU aplicar apenas a migration 047 manualmente via SQL
supabase db execute < supabase/migrations/047_enforce_single_condominium.sql
```

## Opção 2: Via Supabase Dashboard (Mais Simples)

### Passo 1: Despausar o Projeto

1. Acesse: https://supabase.com/dashboard/project/hyplrlakowbwntkidtcp
2. Clique em "Resume" ou "Unpause"

### Passo 2: Aplicar a Migration

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie o conteúdo do arquivo `supabase/migrations/047_enforce_single_condominium.sql`
4. Cole no editor SQL
5. Clique em **Run** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)

### Passo 3: Verificar

Execute esta query para verificar se foi aplicada:

```sql
-- Verificar se a função foi criada
SELECT 
    routine_name, 
    routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'check_single_active_condominium';

-- Verificar se o trigger foi criado
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'enforce_single_active_condominium';
```

## Opção 3: Via Script Automatizado

Após despausar o projeto, você pode usar o script:

```bash
cd /home/resper/villadelfiori
./scripts/apply_migration_via_cli.sh hyplrlakowbwntkidtcp
```

## Conteúdo da Migration

A migration `047_enforce_single_condominium.sql` contém:

```sql
-- Função para verificar se já existe um condomínio ativo
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

-- Trigger para INSERT e UPDATE
DROP TRIGGER IF EXISTS enforce_single_active_condominium ON condominiums;
CREATE TRIGGER enforce_single_active_condominium
  BEFORE INSERT OR UPDATE ON condominiums
  FOR EACH ROW
  EXECUTE FUNCTION check_single_active_condominium();
```

## Verificação Pós-Aplicação

Após aplicar a migration, teste se está funcionando:

```sql
-- Este comando deve FALHAR se já houver um condomínio ativo
INSERT INTO condominiums (name, is_active) 
VALUES ('Teste Segundo Condomínio', true);
```

Você deve receber o erro:
```
ERROR: Apenas um condomínio pode estar ativo por vez. A aplicação é mono-tenant.
```

## Troubleshooting

### Erro: "project is paused"
- **Solução**: Despause o projeto no Supabase Dashboard

### Erro: "function update_updated_at_column() does not exist"
- **Solução**: A função já deve existir. Se não existir, crie-a primeiro (está na migration 017 ou 045)

### Erro: "relation condominiums does not exist"
- **Solução**: Aplique primeiro a migration `024_create_condominiums_table.sql`

## Próximos Passos

Após aplicar a migration:

1. ✅ Teste o fluxo completo no frontend
2. ✅ Verifique se o condomínio aparece no dashboard
3. ✅ Teste a proteção contra múltiplos condomínios

