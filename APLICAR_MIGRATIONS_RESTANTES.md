# Instruções para Aplicar Migrations Restantes

**Data**: 2025-01-15

## Status

✅ **Migration 042**: Aplicada com sucesso
- View de segurança removida
- RLS habilitado
- Índices adicionados

⚠️ **Migrations 043-046**: Precisam ser aplicadas manualmente

## Como Aplicar

As migrations 043, 044, 045 e 046 foram criadas nos arquivos:
- `supabase/migrations/043_fix_function_search_path.sql`
- `supabase/migrations/044_fix_remaining_functions_search_path.sql`
- `supabase/migrations/045_fix_final_functions_search_path.sql`
- `supabase/migrations/046_optimize_rls_policies.sql`

### Opção 1: Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Copie e cole o conteúdo de cada arquivo
4. Execute cada migration em ordem

### Opção 2: Via Supabase CLI
```bash
cd /home/resper/villadelfiori
supabase db push
```

### Opção 3: Via MCP (se disponível)
As migrations podem ser aplicadas via MCP tools, mas devido ao tamanho dos arquivos, é recomendado aplicar via Dashboard ou CLI.

## Correções Aplicadas Parcialmente

Algumas funções já foram corrigidas via SQL direto:
- ✅ `check_and_update_process_status`
- ✅ `search_knowledge_base`
- ✅ `is_process_creator`
- ✅ `prevent_direct_status_change_to_review`
- ✅ `update_process_status_on_rejection`
- ✅ `refactor_process`
- ✅ `get_next_version_number`
- ✅ `search_knowledge_base_hybrid` (corrigida)
- ✅ `find_related_processes` (corrigida)

## Funções Restantes

Ainda precisam de `SET search_path` fixo (ver migrations 044 e 045):
- Todas as funções de notificações
- Todas as funções de validação de entidades
- Todas as funções de atualização de timestamps
- Funções de geração de descrições

## Políticas RLS

Todas as políticas RLS precisam ser otimizadas (ver migration 046):
- 20+ políticas precisam usar `(select auth.uid())` em vez de `auth.uid()`

