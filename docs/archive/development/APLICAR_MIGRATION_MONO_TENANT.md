# Como Aplicar a Migration Mono-Tenant

## Migration: `047_enforce_single_condominium.sql`

Esta migration garante que apenas um condomínio possa estar ativo por vez, implementando a arquitetura mono-tenant.

## Passo a Passo

### 1. Acessar o Supabase Dashboard

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto do Gabi

### 2. Aplicar a Migration

#### Opção A: Via SQL Editor (Recomendado)

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie o conteúdo do arquivo `supabase/migrations/047_enforce_single_condominium.sql`
4. Cole no editor SQL
5. Clique em **Run** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)

#### Opção B: Via Migrations (se configurado)

Se você tiver o Supabase CLI configurado:

```bash
cd /home/resper/villadelfiori
supabase db push
```

### 3. Verificar se a Migration foi Aplicada

Execute a seguinte query no SQL Editor para verificar:

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

Você deve ver:
- 1 função: `check_single_active_condominium`
- 1 trigger: `enforce_single_active_condominium` na tabela `condominiums`

### 4. Testar a Constraint

Para testar se a constraint está funcionando, tente criar um segundo condomínio ativo:

```sql
-- Este comando deve FALHAR se já houver um condomínio ativo
INSERT INTO condominiums (name, is_active) 
VALUES ('Teste Segundo Condomínio', true);
```

Você deve receber o erro:
```
ERROR: Apenas um condomínio pode estar ativo por vez. A aplicação é mono-tenant.
```

### 5. Limpar Condomínios Existentes (se necessário)

Se você já tiver múltiplos condomínios no banco, desative todos exceto um:

```sql
-- Primeiro, veja quantos condomínios ativos existem
SELECT id, name, is_active, created_at 
FROM condominiums 
WHERE is_active = true 
ORDER BY created_at;

-- Desative todos exceto o mais antigo (ou o que você quiser manter)
UPDATE condominiums 
SET is_active = false 
WHERE id != (
    SELECT id 
    FROM condominiums 
    WHERE is_active = true 
    ORDER BY created_at 
    LIMIT 1
);
```

**⚠️ ATENÇÃO**: Execute esta query apenas se você realmente quiser desativar condomínios existentes. Certifique-se de qual condomínio você quer manter ativo.

## Verificação Final

Após aplicar a migration:

1. ✅ A função `check_single_active_condominium` foi criada
2. ✅ O trigger `enforce_single_active_condominium` foi criado
3. ✅ A constraint impede criação de múltiplos condomínios ativos
4. ✅ Apenas um condomínio está ativo no banco

## Próximos Passos

Após aplicar a migration:

1. Teste o fluxo completo no frontend:
   - Faça login
   - Se não houver condomínio, você será redirecionado para `/setup`
   - Cadastre o condomínio
   - Verifique se aparece no dashboard e no header

2. Teste a proteção:
   - Tente criar um segundo condomínio via interface
   - O botão deve estar desabilitado
   - Se tentar via API, deve receber erro

## Troubleshooting

### Erro: "function update_updated_at_column() does not exist"

Se você receber este erro, a função `update_updated_at_column` não foi criada. Crie-a primeiro:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Erro: "relation condominiums does not exist"

A tabela `condominiums` não existe. Aplique primeiro a migration `024_create_condominiums_table.sql`.

### Erro ao aplicar migration

Se houver algum erro, verifique:
1. Se você tem permissões de administrador no Supabase
2. Se a tabela `condominiums` existe
3. Se não há conflitos com outras migrations

## Suporte

Se encontrar problemas, verifique:
- Logs do Supabase Dashboard
- Console do navegador (F12)
- Logs do servidor Next.js

