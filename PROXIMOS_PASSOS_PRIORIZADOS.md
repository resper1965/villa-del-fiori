# Próximos Passos Priorizados - Gabi - Síndica Virtual

**Data**: 2025-01-15  
**Status Atual**: ✅ Todas as correções críticas de segurança e performance aplicadas

---

## 📊 Status Geral

### ✅ Completo
- ✅ Estrutura completa do banco de dados
- ✅ CRUD completo (processos, usuários, unidades, veículos, fornecedores, entidades, condomínios)
- ✅ Workflow de aprovação completo
- ✅ Pipeline de ingestão RAG (P0)
- ✅ Chat com RAG integrado (P0)
- ✅ Validação de entidades em processos (P1)
- ✅ Sistema de notificações (deployado e ativo)
- ✅ Correções de segurança (P0)
- ✅ Otimizações de performance (P1)
- ✅ Dashboard populado com dados variados

---

## 🎯 Próximos Passos Priorizados

### 🟡 PRIORIDADE ALTA (P1) - Funcionalidades Core

#### 1. Testar e Validar Sistema de Notificações ⚠️
**Status**: ⚠️ **VERIFICAR FUNCIONAMENTO**  
**Estimativa**: 1-2 dias

**Descrição**: O sistema de notificações está deployado, mas precisa ser testado para garantir que está funcionando corretamente.

**Tarefas**:
- [ ] Testar criação automática de notificações via triggers
- [ ] Verificar se notificações aparecem no frontend
- [ ] Testar marcação de notificações como lidas
- [ ] Verificar contador de não lidas
- [ ] Testar diferentes tipos de notificações (aprovação, rejeição, etc.)
- [ ] Corrigir eventuais bugs encontrados

**Arquivos**:
- ✅ `supabase/functions/notifications/index.ts` (deployado)
- ✅ `frontend/src/components/notifications/NotificationBell.tsx`
- ✅ `frontend/src/app/(dashboard)/notifications/page.tsx`

**Dependências**: Nenhuma

---

#### 2. Dashboard de Integridade de Entidades 🟡
**Status**: ⚠️ **PENDENTE**  
**Estimativa**: 3-5 dias

**Descrição**: Criar dashboard para visualizar métricas de integridade de entidades e processos, facilitando a identificação de problemas.

**Tarefas**:
- [ ] Criar página `/admin/integrity` ou `/validation/dashboard`
- [ ] Integrar com função `get_entity_integrity_metrics()`
- [ ] Exibir métricas:
  - Total de entidades (completas vs incompletas)
  - Total de processos (com entidades válidas vs inválidas)
  - Entidades órfãs (não referenciadas)
- [ ] Criar tabela de processos com problemas de entidades
- [ ] Adicionar filtros e busca
- [ ] Adicionar ações rápidas (criar entidade, corrigir processo)

**Dependências**:
- ✅ Função `get_entity_integrity_metrics()` (já existe)
- ✅ Edge Function `integrity-metrics` (já existe)

**Arquivos a criar**:
- `frontend/src/app/(dashboard)/admin/integrity/page.tsx`
- `frontend/src/components/integrity/IntegrityDashboard.tsx`
- `frontend/src/lib/hooks/useIntegrityMetrics.ts` (se necessário)

---

### 🟢 PRIORIDADE MÉDIA (P2) - Melhorias de UX

#### 3. Comentários e Discussões em Processos 🟢
**Status**: ⚠️ **PENDENTE**  
**Estimativa**: 1 semana

**Descrição**: Permitir comentários e discussões em processos para facilitar colaboração durante revisão e aprovação.

**Tarefas**:
- [ ] Criar tabela `process_comments` no banco
- [ ] Criar políticas RLS para comentários
- [ ] Criar Edge Function para gerenciar comentários
- [ ] Criar componente de comentários no frontend
- [ ] Integrar comentários na página de detalhes do processo
- [ ] Adicionar suporte a menções de usuários (@mention)
- [ ] Implementar notificações para menções
- [ ] Adicionar histórico de comentários

**Dependências**:
- ✅ Sistema de processos (já existe)
- ✅ Sistema de autenticação (já existe)
- ✅ Sistema de notificações (já existe)

**Arquivos a criar**:
- `supabase/migrations/047_create_process_comments_table.sql`
- `supabase/functions/process-comments/index.ts`
- `frontend/src/components/processes/ProcessComments.tsx`
- `frontend/src/lib/api/comments.ts`

---

### 🔵 PRIORIDADE BAIXA (P3) - Funcionalidades Avançadas

#### 4. Ingestão de Contratos de Fornecedores (Spec 007) 🔵
**Status**: ⚠️ **PENDENTE**  
**Estimativa**: 3-4 semanas

**Descrição**: Sistema para ingerir contratos de fornecedores e gerar automaticamente processos baseados na análise por IA.

**Tarefas**:
- [ ] Implementar upload de contratos (PDF, DOC, DOCX) via Supabase Storage
- [ ] Criar Edge Function para extração de texto
- [ ] Integrar com serviço de extração (Tesseract, pdf-parse, etc.)
- [ ] Criar Edge Function para análise por IA (LLM)
- [ ] Implementar geração automática de processos
- [ ] Vincular contratos a fornecedores
- [ ] Criar interface de gerenciamento de contratos
- [ ] Adicionar validação e revisão antes de criar processo

**Dependências**:
- ✅ Spec 004 (Validação de Entidades) - já implementado
- ✅ Spec 005 (Base de Conhecimento) - já implementado
- ⚠️ Serviço de extração de texto
- ⚠️ LLM API (OpenAI já configurado)

**Arquivos a criar**:
- `supabase/migrations/048_create_contracts_table.sql`
- `supabase/functions/extract-contract-text/index.ts`
- `supabase/functions/analyze-contract/index.ts`
- `frontend/src/app/(dashboard)/contracts/page.tsx`
- `frontend/src/components/contracts/ContractUpload.tsx`

---

### 🔧 MELHORIAS TÉCNICAS (Opcional)

#### 5. Testes e Qualidade 🔧
**Status**: ⚠️ **PENDENTE**  
**Estimativa**: 2-3 semanas

**Tarefas**:
- [ ] Adicionar testes unitários para funções críticas
- [ ] Adicionar testes de integração para Edge Functions
- [ ] Adicionar testes E2E para fluxos principais
- [ ] Implementar CI/CD
- [ ] Adicionar monitoramento e logging

---

#### 6. Configurações de Segurança no Dashboard 🔧
**Status**: ⚠️ **OPCIONAL**  
**Estimativa**: 30 minutos

**Tarefas**:
- [ ] Habilitar Leaked Password Protection no Supabase Dashboard
- [ ] Habilitar mais opções de MFA no Supabase Dashboard
- [ ] (Opcional) Mover extension `vector` para schema separado

---

## 📋 Recomendações Imediatas

### Próxima Ação Recomendada: **Testar Sistema de Notificações**

Com todas as correções críticas aplicadas, o próximo passo lógico é garantir que o sistema de notificações está funcionando corretamente, pois:
1. ✅ Já está deployado e ativo
2. ✅ É uma funcionalidade importante para UX
3. ✅ Pode ter bugs que precisam ser corrigidos
4. ⏱️ É rápido de testar e validar

**Passos**:
1. Criar um processo de teste
2. Enviar para revisão
3. Aprovar/rejeitar
4. Verificar se notificações foram criadas
5. Verificar se aparecem no frontend
6. Testar marcação como lida

---

### Alternativa: **Dashboard de Integridade**

Se preferir trabalhar em uma funcionalidade nova, o Dashboard de Integridade é uma boa opção porque:
1. ✅ Backend já está pronto (funções SQL existem)
2. ✅ É útil para identificar problemas rapidamente
3. ✅ Complementa a validação de entidades já implementada
4. ⏱️ Estimativa: 3-5 dias

---

## 📊 Resumo de Prioridades

| Prioridade | Item | Status | Estimativa |
|------------|------|--------|------------|
| **P1** | Testar Notificações | ⚠️ Verificar | 1-2 dias |
| **P1** | Dashboard Integridade | ⚠️ Pendente | 3-5 dias |
| **P2** | Comentários em Processos | ⚠️ Pendente | 1 semana |
| **P3** | Ingestão de Contratos | ⚠️ Pendente | 3-4 semanas |
| **Opcional** | Testes e Qualidade | ⚠️ Pendente | 2-3 semanas |
| **Opcional** | Config Segurança | ⚠️ Opcional | 30 min |

---

## 🎯 Decisão Recomendada

**Imediato**: Testar e validar sistema de notificações (1-2 dias)

**Depois**: Implementar Dashboard de Integridade (3-5 dias)

**Futuro**: Comentários em processos e Ingestão de contratos

---

**Todas as correções críticas foram aplicadas. O projeto está pronto para evoluir com novas funcionalidades!** ✅

