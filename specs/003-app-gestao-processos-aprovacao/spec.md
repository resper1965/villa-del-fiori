# Feature Specification: Gabi - Síndica Virtual

**Feature Branch**: `003-app-gestao-processos-aprovacao`  
**Created**: 2024-12-08  
**Updated**: 2025-01-15  
**Status**: ✅ Implemented  
**Application Name**: Gabi - Síndica Virtual  
**Input**: User description: "Aplicação de Gestão de Processos Condominiais com Workflow de Aprovação - Sistema onde stakeholders podem revisar, aprovar ou rejeitar processos, explicar motivos de rejeição e refazer processos baseado no feedback"

## Visão Geral

**Gabi - Síndica Virtual** é uma aplicação web completa para gestão de processos condominiais com workflow de aprovação por stakeholders. O sistema permite que síndico, conselho e administradora revisem, aprovem ou rejeitem processos, com capacidade de refazer processos baseado em feedback estruturado.

### Stack Tecnológica Atual

- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Tables**: TanStack Table (@tanstack/react-table)
- **Deploy**: Vercel (frontend), Supabase (backend)

### Funcionalidades Implementadas

✅ **35 Processos Pré-cadastrados** organizados por categoria  
✅ **Workflow de Aprovação** completo (aprovar/rejeitar com comentários)  
✅ **Sistema de Aprovação de Usuários** com RBAC  
✅ **CRUD Completo de Usuários** (criar, editar, aprovar, deletar)  
✅ **Gestão de Unidades** (apartamentos/casas do condomínio)  
✅ **Gestão de Veículos** (cadastro de veículos com marca, modelo e placa)  
✅ **Gestão de Entidades** (pessoas, empresas, serviços, infraestrutura)  
✅ **Chat com Gabi** (Síndica Virtual) - assistente inteligente  
✅ **Autenticação Segura** com Supabase Auth  
✅ **Interface Moderna** e responsiva  

## User Scenarios & Testing

### User Story 1 - Criação e Visualização de Processos ✅

Stakeholders podem visualizar todos os processos do condomínio organizados por categorias, ver detalhes completos de cada processo e entender o status atual (rascunho, em revisão, aprovado, rejeitado).

**Acceptance Scenarios**:

1. ✅ **Given** que stakeholder acessa a aplicação, **When** visualiza lista de processos, **Then** deve ver processos organizados por categorias (Governança, Operação, Áreas Comuns, Convivência, Eventos, Emergências)

**Nota**: Processos sobre "Acesso e Segurança" podem existir como documentação, mas o sistema não opera sistemas de segurança física ou portaria online.
2. ✅ **Given** que stakeholder seleciona um processo, **When** visualiza detalhes, **Then** deve ver conteúdo completo, variáveis aplicadas, entidades envolvidas e histórico de versões
3. ✅ **Given** que processo está em diferentes status, **When** stakeholder visualiza, **Then** deve ver claramente status atual (rascunho, em revisão, aprovado, rejeitado) com indicadores visuais
4. ✅ **Given** que processo foi rejeitado anteriormente, **When** stakeholder visualiza, **Then** deve ver histórico de rejeições com motivos e versões anteriores

### User Story 2 - Workflow de Aprovação por Stakeholders ✅

Stakeholders autorizados podem aprovar ou rejeitar processos, com sistema garantindo que todos os stakeholders necessários aprovem antes de processo ser considerado aprovado.

**Acceptance Scenarios**:

1. ✅ **Given** que processo está pronto para revisão, **When** stakeholder acessa, **Then** deve ver opções claras para "Aprovar" ou "Rejeitar" com campos para comentários
2. ✅ **Given** que stakeholder aprova processo, **When** confirma aprovação, **Then** sistema deve registrar aprovação e atualizar status
3. ✅ **Given** que stakeholder rejeita, **When** rejeição é registrada, **Then** processo deve ser marcado como "Rejeitado" e retornar para revisão/correção

### User Story 3 - Rejeição com Explicação de Motivos ✅

Quando stakeholder rejeita processo, deve explicar motivo da rejeição de forma estruturada.

**Acceptance Scenarios**:

1. ✅ **Given** que stakeholder rejeita processo, **When** seleciona "Rejeitar", **Then** sistema deve exigir preenchimento obrigatório de campo "Motivo da Rejeição"
2. ✅ **Given** que processo foi rejeitado, **When** criador visualiza, **Then** deve ver motivo da rejeição destacado, identificação do stakeholder que rejeitou e data/hora

### User Story 4 - Refazer Processo Baseado em Feedback ✅

Criador do processo pode refazer processo baseado nos motivos de rejeição, com sistema permitindo edição, criação de nova versão e reenvio para aprovação mantendo histórico.

**Acceptance Scenarios**:

1. ✅ **Given** que processo foi rejeitado com motivo, **When** criador acessa processo, **Then** deve ver opção para editar e criar nova versão
2. ✅ **Given** que criador refaz processo, **When** salva alterações, **Then** sistema deve criar nova versão, manter histórico e permitir reenvio para aprovação

### User Story 5 - Gestão de Stakeholders e Permissões ✅

Sistema gerencia quais stakeholders podem aprovar cada tipo de processo, define permissões (aprovador, visualizador, editor) e permite atribuição de revisores específicos por processo.

**Acceptance Scenarios**:

1. ✅ **Given** que administrador acessa gestão de usuários, **When** visualiza lista, **Then** deve ver todos os usuários com status de aprovação
2. ✅ **Given** que administrador aprova usuário, **When** confirma, **Then** usuário deve receber acesso ao sistema
3. ✅ **Given** que usuário tem role específico, **When** acessa sistema, **Then** deve ver apenas funcionalidades permitidas para seu role

### User Story 6 - CRUD de Usuários ✅

Administradores podem criar, editar, aprovar e deletar usuários do sistema.

**Acceptance Scenarios**:

1. ✅ **Given** que administrador acessa gestão de usuários, **When** clica em "Novo Usuário", **Then** deve ver formulário para criar usuário
2. ✅ **Given** que administrador edita usuário, **When** atualiza informações, **Then** sistema deve salvar alterações
3. ✅ **Given** que administrador deleta usuário, **When** confirma, **Then** usuário deve ser desativado

## Functional Requirements

### Processos
- ✅ **FR-001**: Sistema MUST permitir visualização de processos organizados por categoria
- ✅ **FR-002**: Sistema MUST permitir visualização de detalhes completos de cada processo
- ✅ **FR-003**: Sistema MUST exibir status atual de cada processo (rascunho, em revisão, aprovado, rejeitado)
- ✅ **FR-004**: Sistema MUST manter histórico completo de versões de cada processo

### Workflow de Aprovação
- ✅ **FR-005**: Sistema MUST permitir que stakeholders aprovem processos
- ✅ **FR-006**: Sistema MUST permitir que stakeholders rejeitem processos com motivo obrigatório
- ✅ **FR-007**: Sistema MUST registrar todas as aprovações e rejeições com timestamp e stakeholder
- ✅ **FR-008**: Sistema MUST permitir refazer processo baseado em feedback de rejeição

### Autenticação e Autorização
- ✅ **FR-009**: Sistema MUST usar Supabase Auth para autenticação
- ✅ **FR-010**: Sistema MUST implementar RBAC (admin, syndic, subsindico, council, staff, resident)
- ✅ **FR-011**: Sistema MUST exigir aprovação de administrador para novos usuários
- ✅ **FR-012**: Sistema MUST permitir apenas moradores acessarem chat inicialmente

### Gestão de Usuários
- ✅ **FR-013**: Sistema MUST permitir criar novos usuários (apenas admin)
- ✅ **FR-014**: Sistema MUST permitir editar informações de usuários
- ✅ **FR-015**: Sistema MUST permitir aprovar/rejeitar usuários
- ✅ **FR-016**: Sistema MUST permitir deletar (desativar) usuários

### Entidades
- ✅ **FR-017**: Sistema MUST permitir gerenciar entidades (pessoas, empresas, serviços, infraestrutura)
- ✅ **FR-018**: Sistema MUST incluir entidade do condomínio com informações completas (CNPJ, endereço, etc.)

## Success Criteria

### Measurable Outcomes

- ✅ **SC-001**: Stakeholders conseguem aprovar ou rejeitar processo em menos de 2 minutos
- ✅ **SC-002**: 100% das rejeições incluem motivo obrigatório
- ✅ **SC-003**: Criador consegue refazer processo baseado em motivos de rejeição
- ✅ **SC-004**: Sistema mantém 100% de rastreabilidade de todas as aprovações e versões
- ✅ **SC-005**: 35 processos pré-cadastrados estão disponíveis e organizados corretamente
- ✅ **SC-006**: Sistema impede 100% das tentativas de aprovação por stakeholders sem permissão
- ✅ **SC-007**: Dashboard exibe corretamente status de todos os processos

## Key Entities

- **Processo**: Representa um processo condominial documentado com versionamento
- **Versão de Processo**: Versão específica imutável de um processo
- **Stakeholder**: Pessoa ou entidade que pode aprovar/revisar processos (integrado com Supabase Auth)
- **Aprovação**: Registro de aprovação de processo por stakeholder
- **Rejeição**: Registro de rejeição com motivo obrigatório
- **Entidade**: Pessoas, empresas, serviços ou infraestrutura envolvidos nos processos
- **Usuário**: Usuário do sistema com autenticação via Supabase Auth e aprovação customizada

## Dependencies

- ✅ Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- ✅ Next.js 14+ com App Router
- ✅ React Query para gerenciamento de estado server-side
- ✅ TanStack Table para tabelas avançadas
- ✅ shadcn/ui para componentes de UI

## Out of Scope

- Geração automática de documentos para publicação
- Execução ou automação dos processos (apenas gestão e aprovação)
- Integração com sistemas externos (portaria, câmeras, etc.) - **Nunca fará parte do sistema**
- Sistema de comunicação em tempo real entre stakeholders
- Gestão financeira ou contábil - **Nota**: O sistema pode ter módulo de acompanhamento orçamentário no futuro, mas gestão operacional financeira (contas a pagar/receber, boletos) é de responsabilidade da administradora.
- Sistema de votação eletrônica
- Aplicativo mobile nativo (apenas web responsiva)
