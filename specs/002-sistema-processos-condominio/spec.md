# Feature Specification: Workflow de Aprovação e Gestão de Processos

**Feature Branch**: `002-sistema-processos-condominio`  
**Created**: 2024-12-08  
**Updated**: 2025-01-09  
**Status**: ✅ Implemented  
**Application Name**: Gabi - Síndica Virtual

## Visão Geral

Esta especificação descreve o **workflow de aprovação e gestão de processos condominiais** implementado no sistema Gabi - Síndica Virtual. O sistema permite que stakeholders documentem processos, submetam para revisão, e obtenham aprovação antes de processos serem considerados oficiais.

### Escopo Atual

O sistema atual implementa:
- **Documentação estruturada** de processos condominiais
- **Workflow de aprovação** com múltiplos stakeholders
- **Versionamento** e histórico de alterações
- **Rejeição com feedback** estruturado
- **Refazer processos** baseado em feedback

### Diferença da Visão Original

A visão original (arquivada em `specs/archive/`) descrevia geração automática de documentos oficiais (POPs, manuais, regulamentos) a partir de processos. O sistema atual foca em **gestão e aprovação de processos documentados**, não em geração automática de documentos.

## User Scenarios & Testing

### User Story 1 - Criação de Processo em Rascunho ✅

Stakeholders podem criar processos e mantê-los em status "Rascunho" para edição antes de enviar para aprovação.

**Why this priority**: Rascunho permite desenvolvimento iterativo do processo sem pressão de aprovação imediata.

**Acceptance Scenarios**:

1. ✅ **Given** que stakeholder cria novo processo, **When** preenche informações, **Then** processo é salvo com status "Rascunho"
2. ✅ **Given** que processo está em "Rascunho", **When** stakeholder edita, **Then** pode modificar qualquer campo
3. ✅ **Given** que processo está em "Rascunho", **When** stakeholder salva, **Then** alterações são persistidas sem criar nova versão
4. ✅ **Given** que processo está em "Rascunho", **When** stakeholder visualiza, **Then** vê indicador visual de status "Rascunho"

### User Story 2 - Envio para Aprovação ✅

Criador do processo pode enviar processo em rascunho para aprovação, mudando status para "Em Revisão".

**Why this priority**: Envio para aprovação inicia o workflow de validação pelos stakeholders.

**Acceptance Scenarios**:

1. ✅ **Given** que processo está em "Rascunho", **When** criador clica "Enviar para Aprovação", **Then** status muda para "Em Revisão"
2. ✅ **Given** que processo foi enviado para aprovação, **When** status muda, **Then** processo fica bloqueado para edição pelo criador
3. ✅ **Given** que processo está "Em Revisão", **When** stakeholders visualizam, **Then** veem processo disponível para aprovação/rejeição

### User Story 3 - Aprovação por Stakeholders ✅

Stakeholders autorizados podem aprovar processos em revisão, registrando sua aprovação no sistema.

**Why this priority**: Aprovação valida que processo atende aos requisitos do stakeholder.

**Acceptance Scenarios**:

1. ✅ **Given** que processo está "Em Revisão", **When** stakeholder aprova, **Then** sistema registra aprovação com timestamp e identificação do stakeholder
2. ✅ **Given** que processo foi aprovado, **When** visualiza histórico, **Then** deve ver registro de aprovação com data/hora e stakeholder
3. ✅ **Given** que processo precisa aprovação de múltiplos stakeholders, **When** um aprova, **Then** processo continua "Em Revisão" até todos aprovarem
4. ✅ **Given** que todos stakeholders necessários aprovaram, **When** sistema processa, **Then** status muda para "Aprovado"

### User Story 4 - Rejeição com Motivo Obrigatório ✅

Stakeholders podem rejeitar processos, mas devem fornecer motivo obrigatório explicando a rejeição.

**Why this priority**: Rejeição com motivo permite feedback construtivo e melhoria do processo.

**Acceptance Scenarios**:

1. ✅ **Given** que processo está "Em Revisão", **When** stakeholder seleciona "Rejeitar", **Then** sistema deve exigir campo "Motivo da Rejeição" obrigatório
2. ✅ **Given** que stakeholder tenta rejeitar sem motivo, **When** submete, **Then** sistema deve bloquear e solicitar preenchimento do motivo
3. ✅ **Given** que processo foi rejeitado, **When** criador visualiza, **Then** deve ver motivo da rejeição destacado, stakeholder que rejeitou e data/hora
4. ✅ **Given** que processo foi rejeitado, **When** status muda, **Then** processo retorna para "Rascunho" ou "Rejeitado" permitindo correção

### User Story 5 - Refazer Processo Baseado em Feedback ✅

Criador pode refazer processo rejeitado baseado nos motivos de rejeição, criando nova versão mantendo histórico.

**Why this priority**: Refazer permite correção iterativa baseada em feedback estruturado.

**Acceptance Scenarios**:

1. ✅ **Given** que processo foi rejeitado, **When** criador acessa, **Then** deve ver opção para editar e criar nova versão
2. ✅ **Given** que criador refaz processo, **When** salva alterações, **Then** sistema cria nova versão mantendo versão anterior no histórico
3. ✅ **Given** que nova versão foi criada, **When** criador envia para aprovação, **Then** processo volta para "Em Revisão" com nova versão
4. ✅ **Given** que processo tem múltiplas versões, **When** visualiza histórico, **Then** deve ver todas as versões com datas e motivos de rejeição anteriores

### User Story 6 - Versionamento e Histórico ✅

Sistema mantém histórico completo de todas as versões, aprovações e rejeições de cada processo.

**Why this priority**: Histórico permite rastreabilidade, auditoria e entendimento da evolução do processo.

**Acceptance Scenarios**:

1. ✅ **Given** que processo foi editado, **When** nova versão é criada, **Then** sistema mantém versão anterior e cria nova com número de versão incrementado
2. ✅ **Given** que processo tem histórico, **When** stakeholder visualiza, **Then** deve ver timeline com todas as versões, aprovações e rejeições
3. ✅ **Given** que processo foi aprovado, **When** consulta histórico, **Then** deve ver todas as etapas: criação, envios para aprovação, rejeições (se houver), aprovações finais
4. ✅ **Given** que processo tem versões anteriores, **When** visualiza versão específica, **Then** deve ver conteúdo completo daquela versão

### User Story 7 - Dashboard de Status ✅

Dashboard exibe visão geral de todos os processos com seus status atuais e métricas.

**Why this priority**: Dashboard permite visão executiva do estado dos processos e identificação rápida de processos pendentes.

**Acceptance Scenarios**:

1. ✅ **Given** que stakeholder acessa dashboard, **When** visualiza, **Then** deve ver cards com: total de processos, aprovados, em revisão, rejeitados
2. ✅ **Given** que processos têm diferentes status, **When** dashboard é visualizado, **Then** métricas devem refletir status atualizado
3. ✅ **Given** que stakeholder quer ver processos específicos, **When** filtra por status, **Then** lista deve mostrar apenas processos do status selecionado

## Functional Requirements

### Workflow de Aprovação
- ✅ **FR-001**: Sistema MUST permitir criar processo com status "Rascunho"
- ✅ **FR-002**: Sistema MUST permitir editar processo em status "Rascunho"
- ✅ **FR-003**: Sistema MUST permitir enviar processo de "Rascunho" para "Em Revisão"
- ✅ **FR-004**: Sistema MUST bloquear edição de processo em "Em Revisão" pelo criador
- ✅ **FR-005**: Sistema MUST permitir que stakeholders aprovem processos em "Em Revisão"
- ✅ **FR-006**: Sistema MUST permitir que stakeholders rejeitem processos com motivo obrigatório
- ✅ **FR-007**: Sistema MUST registrar todas as aprovações com timestamp e stakeholder
- ✅ **FR-008**: Sistema MUST registrar todas as rejeições com motivo, timestamp e stakeholder
- ✅ **FR-009**: Sistema MUST mudar status para "Aprovado" quando todos stakeholders necessários aprovarem
- ✅ **FR-010**: Sistema MUST mudar status para "Rejeitado" quando processo é rejeitado

### Versionamento
- ✅ **FR-011**: Sistema MUST criar nova versão quando processo é refeito após rejeição
- ✅ **FR-012**: Sistema MUST manter todas as versões anteriores no histórico
- ✅ **FR-013**: Sistema MUST permitir visualizar qualquer versão anterior
- ✅ **FR-014**: Sistema MUST exibir número de versão e data de cada versão
- ✅ **FR-015**: Sistema MUST manter rastreabilidade de mudanças entre versões

### Feedback e Rejeição
- ✅ **FR-016**: Sistema MUST exigir motivo obrigatório ao rejeitar processo
- ✅ **FR-017**: Sistema MUST exibir motivo de rejeição destacado para o criador
- ✅ **FR-018**: Sistema MUST identificar stakeholder que rejeitou e data/hora
- ✅ **FR-019**: Sistema MUST permitir refazer processo baseado em motivos de rejeição

### Dashboard e Visualização
- ✅ **FR-020**: Sistema MUST exibir dashboard com métricas de processos
- ✅ **FR-021**: Sistema MUST permitir filtrar processos por status
- ✅ **FR-022**: Sistema MUST exibir status atual de cada processo com indicadores visuais
- ✅ **FR-023**: Sistema MUST exibir histórico completo de versões e aprovações

## Success Criteria

### Measurable Outcomes

- ✅ **SC-001**: Stakeholders conseguem aprovar ou rejeitar processo em menos de 2 minutos
- ✅ **SC-002**: 100% das rejeições incluem motivo obrigatório
- ✅ **SC-003**: Criador consegue refazer processo baseado em motivos de rejeição em menos de 5 minutos
- ✅ **SC-004**: Sistema mantém 100% de rastreabilidade de todas as aprovações e versões
- ✅ **SC-005**: Dashboard exibe corretamente status de todos os processos em tempo real
- ✅ **SC-006**: Histórico de versões está 100% completo e acessível

## Key Entities

- **Processo**: Representa um processo condominial documentado
- **Versão de Processo**: Versão específica imutável de um processo
- **Status**: Estado atual do processo (Rascunho, Em Revisão, Aprovado, Rejeitado)
- **Aprovação**: Registro de aprovação de processo por stakeholder com timestamp
- **Rejeição**: Registro de rejeição com motivo obrigatório, stakeholder e timestamp
- **Stakeholder**: Pessoa autorizada a aprovar/revisar processos (admin, syndic, subsindico, council, staff)

## Dependencies

- ✅ Sistema de processos (Spec 001) - já implementado
- ✅ Sistema de autenticação e RBAC - já implementado
- ✅ Supabase (PostgreSQL, Auth) - já implementado
- ✅ Frontend Next.js - já implementado

## Out of Scope (Visão Original)

As seguintes funcionalidades da visão original **não fazem parte do escopo atual**:

- ❌ Geração automática de documentos oficiais (POPs, manuais, regulamentos)
- ❌ Aplicação automática de variáveis em documentos
- ❌ Geração de documentos para publicação em website
- ❌ Revisão crítica automática com identificação de lacunas
- ❌ Templates de documentos com estrutura formal

**Nota**: Estas funcionalidades podem ser implementadas no futuro, mas o sistema atual foca em **gestão e aprovação de processos documentados**, não em geração automática de documentos.

## Próximos Passos

1. ⚠️ Implementar notificações quando processo é enviado para aprovação
2. ⚠️ Implementar notificações quando processo é aprovado/rejeitado
3. ⚠️ Adicionar comentários adicionais nas aprovações (além de rejeição)
4. ⚠️ Implementar aprovação condicional (aprovar com sugestões)

## Referências

- **Spec Original (Arquivada)**: `specs/archive/002-sistema-processos-condominio-ORIGINAL.md`
- **Spec 001**: `specs/001-condominio-gestao-inteligente/spec.md` (visão geral)
- **Spec 003**: `specs/003-app-gestao-processos-aprovacao/spec.md` (implementação detalhada)
- **Estado Atual**: `docs/ESTADO_ATUAL_PROJETO.md`
