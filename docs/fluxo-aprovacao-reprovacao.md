# Fluxo de Aprovação e Reprovação de Processos

## Como Funciona

### 1. Visualização do Processo
- Os processos podem ser visualizados na página de detalhes (`/processes/[id]`)
- Cada processo exibe:
  - Descrição completa
  - Diagrama Mermaid (se disponível)
  - Fluxo de execução (workflow)
  - Entidades envolvidas
  - Variáveis do sistema
  - Histórico de versões

### 2. Diagramas Mermaid
- Os diagramas Mermaid são exibidos na página de detalhes do processo
- Localização: Card "Diagrama do Processo" na página de detalhes
- Condição: O diagrama só aparece se o processo tiver um `mermaid_diagram` definido
- Fonte dos dados:
  - **API**: `process.current_version.content.mermaid_diagram`
  - **Mock**: `displayProcess.current_version.content.mermaid_diagram`
  - **Fallback**: `processesData[].mermaid_diagram` (dados mock)

### 3. Aprovação de Processo

#### Como Aprovar:
1. Acesse a página de detalhes do processo (`/processes/[id]`)
2. Role até o final da página
3. Clique no botão **"Aprovar Processo"** (verde)
4. Um modal será aberto onde você pode:
   - Adicionar comentários opcionais
   - Escolher tipo de aprovação:
     - **Aprovado**: Aprovação completa
     - **Aprovado com Ressalvas**: Aprovação com observações
5. Clique em **"Confirmar Aprovação"**

#### O que acontece:
- Uma requisição é enviada para `POST /api/v1/approvals/{process_id}/approve`
- O processo é marcado como `aprovado` no status
- A aprovação é registrada no histórico
- O processo pode então gerar documentos oficiais

### 4. Reprovação de Processo

#### Como Rejeitar:
1. Acesse a página de detalhes do processo (`/processes/[id]`)
2. Role até o final da página
3. Clique no botão **"Rejeitar Processo"** (vermelho)
4. Um modal será aberto onde você **DEVE**:
   - **Fornecer um motivo obrigatório** (mínimo 10 caracteres)
   - Adicionar comentários adicionais (opcional)
5. Clique em **"Confirmar Rejeição"**

#### O que acontece:
- Uma requisição é enviada para `POST /api/v1/approvals/{process_id}/reject`
- O processo é marcado como `rejeitado` no status
- A rejeição é registrada no histórico com o motivo
- O criador do processo pode ver o motivo e refazer o processo

### 5. Refazer Processo Após Rejeição

Quando um processo é rejeitado:
1. O criador pode ver o motivo da rejeição no histórico
2. Pode editar o processo (criar nova versão)
3. A nova versão deve incorporar o feedback da rejeição
4. O processo volta para status `em_revisao` ou `rascunho`
5. Pode ser submetido novamente para aprovação

## Componentes Envolvidos

### Frontend:
- **Página de Detalhes**: `frontend/src/app/(dashboard)/processes/[id]/page.tsx`
- **Modal de Aprovação**: `frontend/src/components/approvals/ApprovalDialog.tsx`
- **Modal de Rejeição**: `frontend/src/components/approvals/RejectionDialog.tsx`
- **Hooks**: `frontend/src/lib/hooks/useApprovals.ts`

### Backend:
- **Endpoint de Aprovação**: `POST /api/v1/approvals/{process_id}/approve`
- **Endpoint de Rejeição**: `POST /api/v1/approvals/{process_id}/reject`
- **Service**: `backend/src/app/services/approval_service.py`
- **Modelos**: `Approval` e `Rejection` em `backend/src/app/models/`

## Status dos Processos

- **rascunho**: Processo em criação/edição
- **em_revisao**: Processo aguardando aprovação
- **aprovado**: Processo aprovado e pronto para uso
- **rejeitado**: Processo rejeitado, precisa ser refeito

## Observações Importantes

1. **Aprovação/Rejeição são por versão**: Cada versão do processo pode ser aprovada ou rejeitada independentemente
2. **Um stakeholder só pode aprovar/rejeitar uma vez por versão**: Evita duplicação de aprovações
3. **Rejeição requer motivo**: O motivo é obrigatório para garantir feedback útil
4. **Histórico completo**: Todas as aprovações e rejeições ficam registradas no histórico de versões

