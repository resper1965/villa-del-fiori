# Próximos Passos - Gabi - Síndica Virtual

**Data**: 2025-01-15  
**Última Atualização**: 2025-01-15

## 📊 Status Atual

### ✅ Funcionalidades Completas
- ✅ Estrutura completa do banco de dados
- ✅ CRUD de processos, usuários, unidades, veículos, fornecedores, entidades
- ✅ Workflow de aprovação completo
- ✅ Pipeline de ingestão RAG (P0)
- ✅ Chat com RAG integrado (P0)
- ✅ Validação de entidades em processos (P1)
- ✅ Sistema de notificações (estrutura completa, mas precisa verificar se está funcionando)
- ✅ Dashboard populado com dados variados (41 processos)

---

## 🎯 Próximos Passos Priorizados

### 🔴 PRIORIDADE CRÍTICA (P0) - Segurança

#### 1. Corrigir Problemas de Segurança Identificados

**Status**: ⚠️ **URGENTE**  
**Estimativa**: 2-3 dias

**Problemas Críticos**:
1. **View `auth_users_with_metadata` exposta** (ERROR)
   - View expõe dados de `auth.users` para roles anon/authenticated
   - **Ação**: Remover ou restringir acesso à view
   - **Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0002_auth_users_exposed

2. **RLS desabilitado em tabelas públicas** (ERROR)
   - `knowledge_base_documents` sem RLS
   - `knowledge_base_ingestion_status` sem RLS
   - **Ação**: Habilitar RLS e criar políticas adequadas
   - **Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

3. **Funções sem `search_path` fixo** (WARN - 30+ funções)
   - Risco de SQL injection via search_path manipulation
   - **Ação**: Adicionar `SET search_path = public, pg_temp` em todas as funções
   - **Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

**Tarefas**:
- [ ] Remover ou restringir view `auth_users_with_metadata`
- [ ] Habilitar RLS em `knowledge_base_documents`
- [ ] Habilitar RLS em `knowledge_base_ingestion_status`
- [ ] Criar políticas RLS adequadas para ambas as tabelas
- [ ] Adicionar `SET search_path` em todas as funções SQL (30+ funções)
- [ ] Testar políticas RLS após implementação

---

### 🟡 PRIORIDADE ALTA (P1) - Funcionalidades

#### 2. Verificar e Corrigir Sistema de Notificações

**Status**: ⚠️ **PENDENTE**  
**Estimativa**: 1-2 dias

**Observação**: O sistema de notificações foi implementado, mas pode ter problemas de funcionamento baseado nos erros 404 reportados.

**Tarefas**:
- [ ] Verificar se Edge Function `notifications` está deployada e funcionando
- [ ] Testar criação automática de notificações via triggers
- [ ] Verificar se notificações estão sendo criadas corretamente
- [ ] Testar interface de notificações no frontend
- [ ] Corrigir problemas de CORS se necessário
- [ ] Validar que notificações aparecem no dashboard

**Arquivos a verificar**:
- `supabase/functions/notifications/index.ts`
- `supabase/migrations/039_create_notifications_table.sql`
- `supabase/migrations/040_create_notification_triggers.sql`
- `frontend/src/components/notifications/NotificationBell.tsx`

---

#### 3. Otimizar Performance de RLS Policies

**Status**: ⚠️ **IMPORTANTE**  
**Estimativa**: 1 dia

**Problema**: Múltiplas políticas RLS re-avaliam `auth.uid()` para cada linha, causando performance subótima.

**Tarefas**:
- [ ] Atualizar políticas RLS para usar `(select auth.uid())` em vez de `auth.uid()`
- [ ] Aplicar em todas as tabelas afetadas:
  - `chat_conversations` (4 políticas)
  - `chat_messages` (3 políticas)
  - `stakeholders` (1 política)
  - `processes` (1 política)
  - `process_versions` (1 política)
  - `approvals` (1 política)
  - `rejections` (1 política)
  - `entities` (1 política)
  - `validation_results` (3 políticas)
  - `notifications` (2 políticas)
  - `condominiums` (2 políticas)

**Remediation**: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

---

#### 4. Adicionar Índices para Foreign Keys

**Status**: ⚠️ **IMPORTANTE**  
**Estimativa**: 1 dia

**Problema**: Várias foreign keys sem índices cobrindo, impactando performance de joins.

**Tarefas**:
- [ ] Criar índices para foreign keys faltantes:
  - `chat_messages.user_id`
  - `knowledge_base_ingestion_status.process_version_id`
  - `notifications.stakeholder_id`
  - `process_versions.created_by`
  - `process_versions.previous_version_id`
  - `rejections.addressed_in_version_id`
  - `stakeholders.approved_by`

---

### 🟢 PRIORIDADE MÉDIA (P2) - Melhorias

#### 5. Comentários e Discussões em Processos

**Status**: ⚠️ **PENDENTE**  
**Estimativa**: 1 semana

**Descrição**: Permitir comentários e discussões em processos para facilitar colaboração durante revisão.

**Tarefas**:
- [ ] Criar schema de comentários (tabela `process_comments`)
- [ ] Implementar API de comentários (Edge Function)
- [ ] Criar interface de comentários no frontend
- [ ] Adicionar menções de usuários (@mention)
- [ ] Implementar histórico de comentários
- [ ] Adicionar notificações para menções

---

#### 6. Ingestão de Contratos de Fornecedores (Spec 007)

**Status**: ⚠️ **PENDENTE**  
**Estimativa**: 3-4 semanas

**Descrição**: Sistema para ingerir contratos de fornecedores e gerar automaticamente processos baseados na análise por IA.

**Tarefas**:
- [ ] Implementar upload de contratos (PDF, DOC, DOCX)
- [ ] Criar pipeline de extração de texto
- [ ] Implementar análise por IA (LLM)
- [ ] Gerar processos automaticamente
- [ ] Vincular contratos a fornecedores
- [ ] Criar interface de gerenciamento de contratos

---

### 🔵 MELHORIAS TÉCNICAS (P3)

#### 7. Limpeza de Índices Não Utilizados

**Status**: ⚠️ **OPCIONAL**  
**Estimativa**: 1 dia

**Problema**: Múltiplos índices nunca foram usados, ocupando espaço desnecessário.

**Tarefas**:
- [ ] Analisar índices não utilizados (30+ índices)
- [ ] Remover índices realmente não utilizados
- [ ] Manter índices que podem ser úteis no futuro

---

#### 8. Consolidar Políticas RLS Duplicadas

**Status**: ⚠️ **OPCIONAL**  
**Estimativa**: 1 dia

**Problema**: Múltiplas políticas permissivas para o mesmo role/action, impactando performance.

**Tarefas**:
- [ ] Consolidar políticas duplicadas em `condominiums` (UPDATE)
- [ ] Consolidar políticas duplicadas em `entities` (SELECT)
- [ ] Otimizar performance de queries

---

#### 9. Remover Índices Duplicados

**Status**: ⚠️ **OPCIONAL**  
**Estimativa**: 1 hora

**Tarefas**:
- [ ] Remover índice duplicado em `chat_messages` (conversation)
- [ ] Remover índice duplicado em `stakeholders` (auth_user_id)

---

## 📋 Resumo de Prioridades

### 🔴 Urgente (Fazer Agora)
1. **Segurança**: Corrigir exposição de `auth.users` e habilitar RLS
2. **Segurança**: Adicionar `search_path` fixo em funções SQL

### 🟡 Importante (Próxima Semana)
3. **Funcionalidade**: Verificar e corrigir sistema de notificações
4. **Performance**: Otimizar políticas RLS
5. **Performance**: Adicionar índices para foreign keys

### 🟢 Desejável (Próximo Mês)
6. **Funcionalidade**: Comentários em processos
7. **Funcionalidade**: Ingestão de contratos

### 🔵 Opcional (Quando Tiver Tempo)
8. Limpeza de índices não utilizados
9. Consolidar políticas RLS duplicadas
10. Remover índices duplicados

---

## 🎯 Próxima Ação Recomendada

**Imediato**: Começar pela correção de segurança (Item 1 - P0)

1. Remover ou restringir view `auth_users_with_metadata`
2. Habilitar RLS em `knowledge_base_documents` e `knowledge_base_ingestion_status`
3. Adicionar `SET search_path` nas funções SQL mais críticas

**Depois**: Verificar sistema de notificações (Item 2 - P1)

---

## 📝 Notas

- ✅ Dashboard está populado com 41 processos (9 aprovados, 30 em revisão, 2 rejeitados)
- ✅ Todas as migrations foram aplicadas
- ✅ Edge Functions principais estão deployadas
- ⚠️ Problemas de segurança precisam ser corrigidos urgentemente
- ⚠️ Performance pode ser melhorada com otimizações de RLS e índices

---

**Última Atualização**: 2025-01-15

