# Planejamento: Completar Rotina de Processos (60% → 100%)

**Data de Criação**: 2025-01-15  
**Status Atual**: 60% Implementado  
**Meta**: 100% Implementado  
**Baseado em**: `AVALIACAO_ROTINA_PROCESSOS.md` e especificações `002-sistema-processos-condominio` e `003-app-gestao-processos-aprovacao`

---

## 1. Visão Geral

Este documento detalha o planejamento para implementar as funcionalidades faltantes da rotina de processos, levando o sistema de **60% para 100%** de implementação conforme as especificações.

### 1.1 Objetivos

1. ✅ Implementar funcionalidades críticas bloqueadoras
2. ✅ Automatizar transições de status
3. ✅ Completar sistema de versionamento
4. ✅ Melhorar UX e feedback visual
5. ✅ Garantir 100% de rastreabilidade

### 1.2 Escopo

- **Inclui**: Workflow completo, versionamento, histórico, transições automáticas
- **Exclui**: Geração automática de documentos, integrações externas (conforme especificação)

---

## 2. Fases de Implementação

### Fase 1: Funcionalidades Críticas (Bloqueadores) 🔴
**Prioridade**: CRÍTICA  
**Estimativa**: 3-4 dias  
**Objetivo**: Desbloquear workflow básico

### Fase 2: Transições Automáticas e Versionamento 🟠
**Prioridade**: ALTA  
**Estimativa**: 2-3 dias  
**Objetivo**: Automatizar workflow e versionamento

### Fase 3: Histórico e Visualização 🟡
**Prioridade**: ALTA  
**Estimativa**: 2-3 dias  
**Objetivo**: Completar rastreabilidade e UX

### Fase 4: Melhorias e Polimento 🟢
**Prioridade**: MÉDIA  
**Estimativa**: 1-2 dias  
**Objetivo**: Refinamento final

---

## 3. Fase 1: Funcionalidades Críticas (Bloqueadores)

### 3.1 Tarefa 1.1: Implementar "Enviar para Aprovação"

**Descrição**: Permitir que o criador envie um processo de "Rascunho" para "Em Revisão".

**Arquivos a Modificar/Criar**:
- `frontend/src/lib/api/processes-supabase.ts` - Adicionar função `submitForApproval`
- `frontend/src/lib/hooks/useProcesses.ts` - Adicionar mutation `useSubmitProcess`
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar botão e lógica
- `supabase/migrations/031_add_submit_process_function.sql` - Criar função de validação (opcional)

**Critérios de Aceitação**:
- [ ] Botão "Enviar para Aprovação" aparece apenas quando status é "rascunho"
- [ ] Botão só aparece para o criador do processo
- [ ] Ao clicar, status muda para "em_revisao"
- [ ] Processo fica bloqueado para edição após envio
- [ ] Mensagem de sucesso é exibida
- [ ] Lista de processos é atualizada automaticamente

**Implementação Detalhada**:

```typescript
// frontend/src/lib/api/processes-supabase.ts
submitForApproval: async (id: string | number): Promise<Process> => {
  // Validar que processo está em rascunho
  // Validar que usuário é o criador
  // Atualizar status para "em_revisao"
  // Retornar processo atualizado
}
```

**Validações Necessárias**:
- Processo deve estar em status "rascunho"
- Usuário deve ser o criador do processo
- Processo deve ter versão atual válida
- Processo deve ter conteúdo mínimo (nome, categoria, descrição)

**Testes**:
- [ ] Criador pode enviar processo em rascunho
- [ ] Não-criador não vê botão
- [ ] Processo em outro status não mostra botão
- [ ] Status muda corretamente após envio
- [ ] Edição é bloqueada após envio

---

### 3.2 Tarefa 1.2: Implementar "Refazer Processo"

**Descrição**: Permitir que o criador refaça um processo rejeitado, criando nova versão baseada nos motivos de rejeição.

**Arquivos a Modificar/Criar**:
- `frontend/src/lib/api/processes-supabase.ts` - Adicionar função `refactorProcess`
- `frontend/src/lib/hooks/useProcesses.ts` - Adicionar mutation `useRefactorProcess`
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar botão e lógica
- `frontend/src/components/processes/RefactorProcessDialog.tsx` - Criar componente de diálogo
- `supabase/migrations/032_add_refactor_process_function.sql` - Criar função de versionamento

**Critérios de Aceitação**:
- [ ] Botão "Refazer Processo" aparece apenas quando status é "rejeitado"
- [ ] Botão só aparece para o criador do processo
- [ ] Ao clicar, abre diálogo mostrando motivos de rejeição
- [ ] Sistema cria nova versão baseada na versão atual
- [ ] Nova versão tem número incrementado
- [ ] Status muda para "rascunho" após refazer
- [ ] Histórico de rejeições é mantido

**Implementação Detalhada**:

```typescript
// frontend/src/lib/api/processes-supabase.ts
refactorProcess: async (id: string | number, changeSummary?: string): Promise<Process> => {
  // Buscar processo atual
  // Buscar última rejeição
  // Criar nova versão baseada na atual
  // Incrementar version_number
  // Mudar status para "rascunho"
  // Retornar processo atualizado
}
```

**Validações Necessárias**:
- Processo deve estar em status "rejeitado"
- Usuário deve ser o criador do processo
- Deve existir pelo menos uma rejeição
- Versão atual deve existir

**Testes**:
- [ ] Criador pode refazer processo rejeitado
- [ ] Não-criador não vê botão
- [ ] Nova versão é criada corretamente
- [ ] Número de versão é incrementado
- [ ] Status muda para "rascunho"
- [ ] Motivos de rejeição são exibidos

---

### 3.3 Tarefa 1.3: Bloquear Edição em Revisão

**Descrição**: Impedir que processos em "Em Revisão" sejam editados pelo criador.

**Arquivos a Modificar/Criar**:
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar verificação de status
- `frontend/src/components/processes/ProcessForm.tsx` - Bloquear campos quando em revisão
- `supabase/migrations/033_update_rls_block_edit_in_review.sql` - Atualizar RLS policies

**Critérios de Aceitação**:
- [ ] Botão "Editar" não aparece quando status é "em_revisao"
- [ ] Formulário de edição não pode ser aberto quando em revisão
- [ ] Mensagem clara informa que processo está em revisão
- [ ] Apenas stakeholders podem aprovar/rejeitar

**Implementação Detalhada**:

```typescript
// frontend/src/app/(dashboard)/processes/[id]/page.tsx
const canEdit = process.status === "rascunho" && process.creator_id === currentUser.id
const isInReview = process.status === "em_revisao"
```

**Validações Necessárias**:
- Verificar status do processo
- Verificar se usuário é criador
- Verificar permissões de edição

**Testes**:
- [ ] Edição bloqueada quando em revisão
- [ ] Criador não pode editar processo em revisão
- [ ] Mensagem clara é exibida
- [ ] Stakeholders podem aprovar/rejeitar

---

## 4. Fase 2: Transições Automáticas e Versionamento

### 4.1 Tarefa 2.1: Transição Automática para "Aprovado"

**Descrição**: Quando todos stakeholders necessários aprovarem, status muda automaticamente para "aprovado".

**Arquivos a Modificar/Criar**:
- `supabase/migrations/034_create_check_approval_status_function.sql` - Criar função de verificação
- `supabase/migrations/035_create_approval_status_trigger.sql` - Criar trigger após aprovação
- `frontend/src/lib/api/approvals-supabase.ts` - Atualizar para chamar função

**Critérios de Aceitação**:
- [ ] Função verifica se todos stakeholders aprovaram
- [ ] Trigger executa após cada aprovação
- [ ] Status muda automaticamente para "aprovado"
- [ ] Notificação é enviada (futuro)

**Implementação Detalhada**:

```sql
-- supabase/migrations/034_create_check_approval_status_function.sql
CREATE OR REPLACE FUNCTION check_and_update_process_status()
RETURNS TRIGGER AS $$
DECLARE
  required_approvals INTEGER;
  current_approvals INTEGER;
  process_status TEXT;
BEGIN
  -- Buscar status atual do processo
  SELECT status INTO process_status
  FROM processes
  WHERE id = NEW.process_id;
  
  -- Se já está aprovado ou rejeitado, não fazer nada
  IF process_status IN ('aprovado', 'rejeitado') THEN
    RETURN NEW;
  END IF;
  
  -- Contar aprovações necessárias (por enquanto, considerar todos stakeholders)
  -- TODO: Implementar lógica de stakeholders necessários por processo
  SELECT COUNT(DISTINCT stakeholder_id) INTO current_approvals
  FROM approvals
  WHERE process_id = NEW.process_id
    AND version_id = NEW.version_id;
  
  -- Se todos aprovaram, mudar status
  -- Por enquanto, considerar 1 aprovação suficiente (simplificado)
  -- TODO: Implementar lógica de stakeholders necessários
  IF current_approvals >= 1 THEN
    UPDATE processes
    SET status = 'aprovado',
        updated_at = NOW()
    WHERE id = NEW.process_id
      AND status = 'em_revisao';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Validações Necessárias**:
- Verificar se processo está em "em_revisao"
- Contar aprovações da versão atual
- Verificar se todos stakeholders necessários aprovaram

**Testes**:
- [ ] Status muda automaticamente após aprovação
- [ ] Apenas aprovações da versão atual contam
- [ ] Processo não muda se já está aprovado/rejeitado

---

### 4.2 Tarefa 2.2: Transição Automática para "Rejeitado"

**Descrição**: Quando processo é rejeitado, status muda automaticamente para "rejeitado".

**Arquivos a Modificar/Criar**:
- `supabase/migrations/036_create_rejection_status_trigger.sql` - Criar trigger após rejeição
- `frontend/src/lib/api/approvals-supabase.ts` - Atualizar para garantir transição

**Critérios de Aceitação**:
- [ ] Trigger executa após rejeição
- [ ] Status muda automaticamente para "rejeitado"
- [ ] Processo pode ser refeito após rejeição

**Implementação Detalhada**:

```sql
-- supabase/migrations/036_create_rejection_status_trigger.sql
CREATE OR REPLACE FUNCTION update_process_status_on_rejection()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE processes
  SET status = 'rejeitado',
      updated_at = NOW()
  WHERE id = NEW.process_id
    AND status = 'em_revisao';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_status_on_rejection
  AFTER INSERT ON rejections
  FOR EACH ROW
  EXECUTE FUNCTION update_process_status_on_rejection();
```

**Validações Necessárias**:
- Verificar se processo está em "em_revisao"
- Apenas uma rejeição é necessária para mudar status

**Testes**:
- [ ] Status muda automaticamente após rejeição
- [ ] Processo pode ser refeito após rejeição
- [ ] Aprovações não são mais aceitas após rejeição

---

### 4.3 Tarefa 2.3: Automatizar Incremento de Versão

**Descrição**: Quando processo é refeito, versão é incrementada automaticamente.

**Arquivos a Modificar/Criar**:
- `supabase/migrations/037_create_increment_version_function.sql` - Criar função de incremento
- `frontend/src/lib/api/processes-supabase.ts` - Usar função ao refazer

**Critérios de Aceitação**:
- [ ] Versão é incrementada automaticamente
- [ ] Versão anterior é mantida
- [ ] `current_version_number` é atualizado

**Implementação Detalhada**:

```sql
-- supabase/migrations/037_create_increment_version_function.sql
CREATE OR REPLACE FUNCTION create_new_process_version(
  p_process_id UUID,
  p_content JSONB,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_version_number INTEGER;
  current_version_id UUID;
BEGIN
  -- Buscar versão atual
  SELECT id, version_number INTO current_version_id, new_version_number
  FROM process_versions
  WHERE process_id = p_process_id
  ORDER BY version_number DESC
  LIMIT 1;
  
  -- Incrementar versão
  new_version_number := COALESCE(new_version_number, 0) + 1;
  
  -- Criar nova versão
  INSERT INTO process_versions (
    process_id,
    version_number,
    content,
    content_text,
    previous_version_id,
    change_summary,
    created_by,
    status
  )
  SELECT
    p_process_id,
    new_version_number,
    p_content,
    p_content->>'description',
    current_version_id,
    p_change_summary,
    creator_id,
    'rascunho'
  FROM processes
  WHERE id = p_process_id;
  
  -- Atualizar processo
  UPDATE processes
  SET current_version_number = new_version_number,
      status = 'rascunho',
      updated_at = NOW()
  WHERE id = p_process_id;
  
  RETURN new_version_number;
END;
$$ LANGUAGE plpgsql;
```

**Validações Necessárias**:
- Processo deve existir
- Versão anterior deve existir
- Conteúdo deve ser válido

**Testes**:
- [ ] Versão é incrementada corretamente
- [ ] Versão anterior é mantida
- [ ] `current_version_number` é atualizado

---

## 5. Fase 3: Histórico e Visualização

### 5.1 Tarefa 3.1: Visualizar Histórico de Versões

**Descrição**: Exibir timeline completa de todas as versões do processo.

**Arquivos a Modificar/Criar**:
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar seção de histórico
- `frontend/src/components/processes/VersionHistory.tsx` - Criar componente de histórico
- `frontend/src/lib/api/processes-supabase.ts` - Adicionar função para buscar versões

**Critérios de Aceitação**:
- [ ] Timeline mostra todas as versões
- [ ] Cada versão mostra data, status, criador
- [ ] Versão atual é destacada
- [ ] Versões anteriores podem ser visualizadas

**Implementação Detalhada**:

```typescript
// frontend/src/components/processes/VersionHistory.tsx
interface VersionHistoryProps {
  processId: string
  currentVersionNumber: number
}

export function VersionHistory({ processId, currentVersionNumber }: VersionHistoryProps) {
  // Buscar todas as versões
  // Exibir timeline
  // Destacar versão atual
  // Permitir visualizar versões anteriores
}
```

**Validações Necessárias**:
- Processo deve existir
- Versões devem ser carregadas corretamente

**Testes**:
- [ ] Todas as versões são exibidas
- [ ] Versão atual é destacada
- [ ] Datas e status são corretos
- [ ] Visualização de versões anteriores funciona

---

### 5.2 Tarefa 3.2: Exibir Motivos de Rejeição Destacados

**Descrição**: Quando processo está rejeitado, exibir motivos de forma destacada.

**Arquivos a Modificar/Criar**:
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar seção de rejeições
- `frontend/src/components/processes/RejectionDetails.tsx` - Criar componente de rejeição
- `frontend/src/lib/api/approvals-supabase.ts` - Adicionar função para buscar rejeições

**Critérios de Aceitação**:
- [ ] Motivos de rejeição são exibidos quando status é "rejeitado"
- [ ] Stakeholder que rejeitou é identificado
- [ ] Data/hora da rejeição é exibida
- [ ] Motivos são destacados visualmente

**Implementação Detalhada**:

```typescript
// frontend/src/components/processes/RejectionDetails.tsx
interface RejectionDetailsProps {
  processId: string
  versionId: string
}

export function RejectionDetails({ processId, versionId }: RejectionDetailsProps) {
  // Buscar rejeições
  // Exibir motivos destacados
  // Mostrar stakeholder e data
}
```

**Validações Necessárias**:
- Processo deve estar rejeitado
- Rejeições devem existir

**Testes**:
- [ ] Motivos são exibidos corretamente
- [ ] Stakeholder é identificado
- [ ] Data/hora é correta
- [ ] Visual é destacado

---

### 5.3 Tarefa 3.3: Comparação entre Versões

**Descrição**: Permitir comparar versões diferentes do processo.

**Arquivos a Modificar/Criar**:
- `frontend/src/components/processes/VersionComparison.tsx` - Criar componente de comparação
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar botão de comparação

**Critérios de Aceitação**:
- [ ] Usuário pode selecionar duas versões para comparar
- [ ] Diferenças são destacadas
- [ ] Comparação mostra mudanças em conteúdo, entidades, variáveis

**Implementação Detalhada**:

```typescript
// frontend/src/components/processes/VersionComparison.tsx
interface VersionComparisonProps {
  processId: string
  version1: number
  version2: number
}

export function VersionComparison({ processId, version1, version2 }: VersionComparisonProps) {
  // Buscar ambas versões
  // Comparar conteúdo
  // Destacar diferenças
}
```

**Validações Necessárias**:
- Ambas versões devem existir
- Versões devem ser diferentes

**Testes**:
- [ ] Comparação funciona corretamente
- [ ] Diferenças são destacadas
- [ ] Interface é clara

---

## 6. Fase 4: Melhorias e Polimento

### 6.1 Tarefa 4.1: Indicador de Progresso de Aprovações

**Descrição**: Mostrar quantos stakeholders já aprovaram e quantos faltam.

**Arquivos a Modificar/Criar**:
- `frontend/src/components/processes/ApprovalProgress.tsx` - Criar componente de progresso
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar indicador

**Critérios de Aceitação**:
- [ ] Progresso é exibido quando processo está em revisão
- [ ] Mostra quantos aprovaram e quantos faltam
- [ ] Lista stakeholders que aprovaram

**Implementação Detalhada**:

```typescript
// frontend/src/components/processes/ApprovalProgress.tsx
interface ApprovalProgressProps {
  processId: string
  versionId: string
}

export function ApprovalProgress({ processId, versionId }: ApprovalProgressProps) {
  // Buscar aprovações
  // Calcular progresso
  // Exibir indicador visual
}
```

---

### 6.2 Tarefa 4.2: Validação antes de Enviar

**Descrição**: Validar que processo está completo antes de enviar para aprovação.

**Arquivos a Modificar/Criar**:
- `frontend/src/lib/utils/processValidation.ts` - Criar funções de validação
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx` - Adicionar validação

**Critérios de Aceitação**:
- [ ] Validação verifica campos obrigatórios
- [ ] Mensagens de erro são claras
- [ ] Processo não pode ser enviado se incompleto

**Validações Necessárias**:
- Nome deve estar preenchido
- Categoria deve estar selecionada
- Descrição deve ter conteúdo mínimo
- Versão atual deve existir

---

### 6.3 Tarefa 4.3: Notificações (Futuro)

**Descrição**: Notificar stakeholders quando processo é enviado para aprovação ou aprovado/rejeitado.

**Status**: ⚠️ **FUTURO** - Não é crítico para 100% de funcionalidade

**Nota**: Pode ser implementado posteriormente com sistema de notificações.

---

## 7. Migrations Necessárias

### 7.1 Lista de Migrations

1. `031_add_submit_process_function.sql` - Função para enviar processo
2. `032_add_refactor_process_function.sql` - Função para refazer processo
3. `033_update_rls_block_edit_in_review.sql` - Atualizar RLS para bloquear edição
4. `034_create_check_approval_status_function.sql` - Função para verificar aprovações
5. `035_create_approval_status_trigger.sql` - Trigger para mudar status após aprovação
6. `036_create_rejection_status_trigger.sql` - Trigger para mudar status após rejeição
7. `037_create_increment_version_function.sql` - Função para incrementar versão

### 7.2 Ordem de Aplicação

As migrations devem ser aplicadas na ordem numérica (031 → 037).

---

## 8. Arquivos a Modificar/Criar

### 8.1 Frontend

**Modificar**:
- `frontend/src/lib/api/processes-supabase.ts`
- `frontend/src/lib/api/approvals-supabase.ts`
- `frontend/src/lib/hooks/useProcesses.ts`
- `frontend/src/app/(dashboard)/processes/[id]/page.tsx`
- `frontend/src/components/processes/ProcessForm.tsx`

**Criar**:
- `frontend/src/components/processes/RefactorProcessDialog.tsx`
- `frontend/src/components/processes/VersionHistory.tsx`
- `frontend/src/components/processes/RejectionDetails.tsx`
- `frontend/src/components/processes/VersionComparison.tsx`
- `frontend/src/components/processes/ApprovalProgress.tsx`
- `frontend/src/lib/utils/processValidation.ts`

### 8.2 Backend (Supabase)

**Criar**:
- `supabase/migrations/031_add_submit_process_function.sql`
- `supabase/migrations/032_add_refactor_process_function.sql`
- `supabase/migrations/033_update_rls_block_edit_in_review.sql`
- `supabase/migrations/034_create_check_approval_status_function.sql`
- `supabase/migrations/035_create_approval_status_trigger.sql`
- `supabase/migrations/036_create_rejection_status_trigger.sql`
- `supabase/migrations/037_create_increment_version_function.sql`

---

## 9. Testes

### 9.1 Testes Unitários

- [ ] Função `submitForApproval` funciona corretamente
- [ ] Função `refactorProcess` cria nova versão
- [ ] Triggers executam corretamente
- [ ] Validações funcionam

### 9.2 Testes de Integração

- [ ] Workflow completo funciona (criar → enviar → aprovar → aprovado)
- [ ] Workflow de rejeição funciona (criar → enviar → rejeitar → refazer)
- [ ] Versionamento funciona corretamente
- [ ] Histórico é mantido corretamente

### 9.3 Testes de UX

- [ ] Interface é intuitiva
- [ ] Mensagens são claras
- [ ] Feedback visual é adequado
- [ ] Performance é aceitável

---

## 10. Critérios de Sucesso

### 10.1 Funcionalidades

- [ ] ✅ 100% dos Functional Requirements implementados (23/23)
- [ ] ✅ 100% dos Success Criteria atendidos (6/6)
- [ ] ✅ Workflow completo funcional
- [ ] ✅ Versionamento completo
- [ ] ✅ Histórico completo

### 10.2 Qualidade

- [ ] ✅ Código testado
- [ ] ✅ Sem erros de lint
- [ ] ✅ Performance adequada
- [ ] ✅ UX polida

### 10.3 Documentação

- [ ] ✅ Código documentado
- [ ] ✅ Migrations documentadas
- [ ] ✅ README atualizado

---

## 11. Cronograma Estimado

| Fase | Tarefas | Estimativa | Dependências |
|------|---------|------------|--------------|
| **Fase 1** | 3 tarefas críticas | 3-4 dias | Nenhuma |
| **Fase 2** | 3 tarefas de automação | 2-3 dias | Fase 1 |
| **Fase 3** | 3 tarefas de visualização | 2-3 dias | Fase 1, Fase 2 |
| **Fase 4** | 2-3 tarefas de polimento | 1-2 dias | Fase 1, Fase 2, Fase 3 |
| **Total** | 11-12 tarefas | **8-12 dias** | - |

**Nota**: Estimativas assumem trabalho em tempo integral. Ajustar conforme disponibilidade.

---

## 12. Riscos e Mitigações

### 12.1 Riscos Identificados

1. **Complexidade de Triggers**: Triggers podem ter comportamento inesperado
   - **Mitigação**: Testar extensivamente em ambiente de desenvolvimento

2. **Performance**: Múltiplas queries podem impactar performance
   - **Mitigação**: Otimizar queries, usar índices, cache quando apropriado

3. **Concorrência**: Múltiplos usuários podem aprovar simultaneamente
   - **Mitigação**: Usar transações, locks quando necessário

4. **RLS Policies**: Políticas podem bloquear operações legítimas
   - **Mitigação**: Testar todas as permissões, ajustar policies conforme necessário

---

## 13. Próximos Passos Imediatos

1. ✅ **Revisar este planejamento** com stakeholders
2. ✅ **Priorizar fases** conforme necessidade do negócio
3. ✅ **Iniciar Fase 1** - Funcionalidades Críticas
4. ✅ **Aplicar migrations** em ordem
5. ✅ **Testar cada funcionalidade** após implementação
6. ✅ **Documentar** mudanças e decisões

---

## 14. Conclusão

Este planejamento detalha todas as tarefas necessárias para completar a rotina de processos de **60% para 100%**. As fases estão organizadas por prioridade, com funcionalidades críticas primeiro, seguidas de automações, visualizações e polimento.

**Meta**: Implementar todas as funcionalidades faltantes em **8-12 dias** de trabalho, resultando em um sistema completo e funcional conforme as especificações.

---

**Última Atualização**: 2025-01-15  
**Status do Planejamento**: ✅ Pronto para Implementação



