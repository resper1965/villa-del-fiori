# Fluxo de Aprovação e Reprovação de Processos

**Última Atualização**: 2025-01-15

---

## 📋 Visão Geral

O sistema de aprovação permite que stakeholders (síndico, conselho, administradora) revisem, aprovem ou rejeitem processos antes que sejam considerados oficiais. Cada versão de um processo pode ser aprovada ou rejeitada independentemente.

---

## 🔄 Estados do Processo

### Status Disponíveis

- **`rascunho`**: Processo em criação/edição
- **`em_revisao`**: Processo aguardando aprovação
- **`aprovado`**: Processo aprovado e pronto para uso
- **`rejeitado`**: Processo rejeitado, precisa ser refeito

---

## ✅ Aprovação de Processo

### Como Aprovar

1. Acesse a página de detalhes do processo (`/processes/[id]`)
2. Role até o final da página
3. Clique no botão **"Aprovar Processo"** (verde)
4. Um modal será aberto onde você pode:
   - Adicionar comentários opcionais
5. Clique em **"Confirmar Aprovação"**

### O que Acontece

- O processo é marcado como `aprovado` no status
- A aprovação é registrada no histórico de versões
- O processo é automaticamente marcado para ingestão na base de conhecimento
- Notificações são enviadas aos stakeholders relevantes

---

## ❌ Reprovação de Processo

### Como Rejeitar

1. Acesse a página de detalhes do processo (`/processes/[id]`)
2. Role até o final da página
3. Clique no botão **"Rejeitar Processo"** (vermelho)
4. Um modal será aberto onde você **DEVE**:
   - **Fornecer um motivo obrigatório** (mínimo 10 caracteres)
   - Adicionar comentários adicionais (opcional)
5. Clique em **"Confirmar Rejeição"**

### O que Acontece

- O processo é marcado como `rejeitado` no status
- A rejeição é registrada no histórico com o motivo
- O criador do processo pode ver o motivo e refazer o processo
- Notificações são enviadas aos stakeholders relevantes

---

## 🔄 Refazer Processo Após Rejeição

### Como Funciona

Quando um processo é rejeitado:

1. O criador pode ver o motivo da rejeição no histórico
2. Pode editar o processo (criar nova versão)
3. A nova versão deve incorporar o feedback da rejeição
4. O processo volta para status `em_revisao` ou `rascunho`
5. Pode ser submetido novamente para aprovação

### Histórico de Versões

- Todas as versões anteriores são preservadas
- Cada versão mantém seu próprio histórico de aprovações/rejeições
- É possível comparar versões
- A versão mais recente aprovada é considerada a oficial

---

## 👥 Stakeholders que Podem Aprovar

### Permissões

- **Síndico** (`syndic`): Pode aprovar processos
- **Subsíndico** (`subsindico`): Pode aprovar processos
- **Conselho** (`council`): Pode aprovar processos
- **Staff/Administradora** (`staff`): Pode aprovar processos
- **Admin** (`admin`): Pode aprovar processos

### Regras

- Um stakeholder só pode aprovar/rejeitar uma vez por versão
- Evita duplicação de aprovações
- Histórico completo de todas as ações

---

## 📊 Rastreabilidade

### Informações Registradas

Para cada aprovação/rejeição:

- **Quem**: Stakeholder que aprovou/rejeitou
- **Quando**: Timestamp da ação
- **Motivo**: Motivo da rejeição (obrigatório)
- **Comentários**: Comentários adicionais (opcional)
- **Versão**: Versão específica do processo

### Histórico Completo

- Todas as aprovações e rejeições ficam registradas
- Histórico é preservado mesmo após novas versões
- Permite auditoria completa do processo

---

## 🔔 Notificações

### Tipos de Notificações

- **Aprovação Pendente**: Quando processo é enviado para revisão
- **Processo Aprovado**: Quando processo é aprovado
- **Processo Rejeitado**: Quando processo é rejeitado
- **Nova Versão**: Quando nova versão é criada após rejeição

### Destinatários

- Criador do processo
- Stakeholders que podem aprovar
- Stakeholders envolvidos no processo

---

## 🎯 Fluxo Completo

### Exemplo: Processo de Aprovação de Obras

1. **Criação**: Síndico cria processo "Aprovação de Obras" (status: `rascunho`)
2. **Envio para Revisão**: Síndico envia para aprovação (status: `em_revisao`)
3. **Revisão**: Conselho revisa o processo
4. **Rejeição**: Conselho rejeita com motivo "Falta orçamento detalhado" (status: `rejeitado`)
5. **Refazer**: Síndico edita processo, adiciona orçamento, cria nova versão (status: `em_revisao`)
6. **Aprovação**: Conselho aprova a nova versão (status: `aprovado`)
7. **Indexação**: Processo é automaticamente indexado na base de conhecimento

---

## 📝 Observações Importantes

1. **Aprovação/Rejeição são por versão**: Cada versão do processo pode ser aprovada ou rejeitada independentemente
2. **Um stakeholder só pode aprovar/rejeitar uma vez por versão**: Evita duplicação de aprovações
3. **Rejeição requer motivo**: O motivo é obrigatório para garantir feedback útil
4. **Histórico completo**: Todas as aprovações e rejeições ficam registradas no histórico de versões
5. **Processos aprovados são indexados**: Apenas processos aprovados são indexados na base de conhecimento

---

## 🔗 Componentes Relacionados

### Frontend

- **Página de Detalhes**: `frontend/src/app/(dashboard)/processes/[id]/page.tsx`
- **Modal de Aprovação**: `frontend/src/components/approvals/ApprovalDialog.tsx`
- **Modal de Rejeição**: `frontend/src/components/approvals/RejectionDialog.tsx`
- **Hooks**: `frontend/src/lib/hooks/useApprovals.ts`

### Backend

- **Tabela**: `processes` (status do processo)
- **Tabela**: `process_versions` (versões do processo)
- **Tabela**: `approvals` (histórico de aprovações)
- **Tabela**: `rejections` (histórico de rejeições)

---

**Última Atualização**: 2025-01-15
