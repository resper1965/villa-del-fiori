# Feature Specification: Sistema de Gestão de Processos Condominiais

**Feature Branch**: `001-condominio-gestao-inteligente`  
**Created**: 2024-12-08  
**Updated**: 2025-01-09  
**Status**: ✅ Implemented  
**Application Name**: Gabi - Síndica Virtual

## Visão Geral

**Gabi - Síndica Virtual** é um sistema de gestão de processos condominiais documentados com workflow de aprovação. O sistema permite que stakeholders (síndico, conselho, administradora) documentem, revisem, aprovem ou rejeitem processos operacionais, administrativos e de convivência do condomínio.

### Escopo Atual

O sistema atual foca em **gestão documental de processos**, não em operação direta do condomínio. Ele permite:
- Documentar processos condominiais de forma estruturada
- Organizar processos por categorias
- Gerenciar workflow de aprovação por stakeholders
- Manter histórico e versionamento de processos
- Consultar processos aprovados via chat assistente

### Diferença da Visão Original

A visão original (arquivada em `specs/archive/`) descrevia um sistema operacional completo incluindo gestão financeira, controle de acesso físico, portaria online, etc. O projeto atual focou em **gestão documental de processos**, que é o MVP implementado e funcional.

**Importante**: Controle de acesso físico e portaria online integrada **nunca farão parte do sistema**. O sistema foca em documentação, não em operação de sistemas físicos.

## User Scenarios & Testing

### User Story 1 - Criação e Documentação de Processos ✅

Stakeholders podem criar e documentar processos condominiais de forma estruturada, organizando-os por categorias e incluindo todas as informações necessárias.

**Why this priority**: A documentação de processos é a base do sistema. Sem ela, não há conteúdo para gerenciar, aprovar ou consultar.

**Acceptance Scenarios**:

1. ✅ **Given** que stakeholder acessa o sistema, **When** cria novo processo, **Then** deve poder preencher: nome, categoria, descrição, workflow, entidades envolvidas, diagrama Mermaid, matriz RACI
2. ✅ **Given** que processo está sendo criado, **When** seleciona categoria, **Then** deve ver categorias disponíveis: Governança, Operação, Áreas Comuns, Convivência, Eventos, Emergências

**Nota**: A categoria "Acesso e Segurança" pode existir no banco de dados para processos documentados sobre esses temas, mas o sistema **não opera** sistemas de segurança física ou portaria online.
3. ✅ **Given** que processo foi criado, **When** salva, **Then** processo fica em status "Rascunho" e pode ser editado
4. ✅ **Given** que processo existe, **When** stakeholder visualiza, **Then** deve ver todas as informações documentadas de forma clara e organizada

### User Story 2 - Organização por Categorias ✅

Processos são organizados hierarquicamente por categorias e subcategorias, facilitando navegação e localização.

**Why this priority**: Organização clara é essencial para que stakeholders encontrem processos relevantes rapidamente.

**Acceptance Scenarios**:

1. ✅ **Given** que existem processos em múltiplas categorias, **When** stakeholder navega, **Then** deve ver processos organizados por categoria
2. ✅ **Given** que stakeholder busca processo, **When** filtra por categoria, **Then** deve ver apenas processos da categoria selecionada
3. ✅ **Given** que processo está em categoria específica, **When** visualiza, **Then** deve ver claramente a categoria e subcategoria

### User Story 3 - Workflow de Aprovação ✅

Stakeholders autorizados podem revisar, aprovar ou rejeitar processos, garantindo que apenas processos validados sejam considerados aprovados.

**Why this priority**: Aprovação garante qualidade e validação dos processos documentados antes de serem considerados oficiais.

**Acceptance Scenarios**:

1. ✅ **Given** que processo está em "Rascunho", **When** criador envia para aprovação, **Then** status muda para "Em Revisão"
2. ✅ **Given** que processo está "Em Revisão", **When** stakeholder aprova, **Then** sistema registra aprovação e atualiza status
3. ✅ **Given** que processo está "Em Revisão", **When** stakeholder rejeita, **Then** deve fornecer motivo obrigatório e processo retorna para correção
4. ✅ **Given** que processo foi aprovado por todos stakeholders necessários, **When** sistema processa, **Then** status muda para "Aprovado"

### User Story 4 - Rejeição com Feedback ✅

Quando processo é rejeitado, stakeholder deve explicar motivo, permitindo que criador corrija e refaça o processo.

**Why this priority**: Feedback estruturado permite melhoria contínua dos processos e garante que rejeições sejam construtivas.

**Acceptance Scenarios**:

1. ✅ **Given** que stakeholder rejeita processo, **When** seleciona "Rejeitar", **Then** sistema deve exigir campo "Motivo da Rejeição" obrigatório
2. ✅ **Given** que processo foi rejeitado, **When** criador visualiza, **Then** deve ver motivo da rejeição destacado, stakeholder que rejeitou e data/hora
3. ✅ **Given** que processo foi rejeitado, **When** criador refaz, **Then** pode criar nova versão mantendo histórico

### User Story 5 - Versionamento e Histórico ✅

Sistema mantém histórico completo de versões de cada processo, permitindo rastreabilidade e auditoria.

**Why this priority**: Versionamento permite entender evolução dos processos e manter histórico para auditoria.

**Acceptance Scenarios**:

1. ✅ **Given** que processo foi editado, **When** salva nova versão, **Then** sistema mantém versão anterior e cria nova
2. ✅ **Given** que processo tem histórico, **When** stakeholder visualiza, **Then** deve ver todas as versões com datas e alterações
3. ✅ **Given** que processo foi aprovado, **When** consulta histórico, **Then** deve ver todas as aprovações e rejeições anteriores

### User Story 6 - Gestão de Entidades ✅

Sistema permite gerenciar entidades (pessoas, empresas, serviços, infraestrutura) que são referenciadas nos processos.

**Why this priority**: Entidades permitem rastreabilidade e relacionamento entre processos e elementos do condomínio.

**Acceptance Scenarios**:

1. ✅ **Given** que stakeholder acessa gestão de entidades, **When** visualiza, **Then** deve ver lista de entidades organizadas por tipo
2. ✅ **Given** que stakeholder cria entidade, **When** preenche informações, **Then** entidade fica disponível para referência em processos
3. ✅ **Given** que processo referencia entidade, **When** visualiza processo, **Then** deve ver entidades envolvidas com links para detalhes

### User Story 7 - Consulta via Chat Assistente ⚠️

Moradores podem consultar processos aprovados via chat com assistente virtual (Gabi).

**Why this priority**: Chat permite acesso fácil e intuitivo aos processos para moradores, sem necessidade de navegar manualmente.

**Acceptance Scenarios**:

1. ✅ **Given** que morador acessa chat, **When** faz pergunta sobre processo, **Then** interface de chat está disponível
2. ⚠️ **Given** que morador pergunta sobre processo, **When** chat processa, **Then** deve retornar resposta baseada em processos aprovados (backend pendente - Spec 005/006)
3. ⚠️ **Given** que resposta é gerada, **When** exibida, **Then** deve incluir referências aos processos usados como fonte (pendente)

## Functional Requirements

### Processos
- ✅ **FR-001**: Sistema MUST permitir criar processos com: nome, categoria, descrição, workflow, entidades, diagrama Mermaid, matriz RACI
- ✅ **FR-002**: Sistema MUST organizar processos por categorias: Governança, Operação, Áreas Comuns, Convivência, Eventos, Emergências
- ✅ **FR-003**: Sistema MUST permitir editar processos em status "Rascunho"
- ✅ **FR-004**: Sistema MUST manter histórico de versões de cada processo
- ✅ **FR-005**: Sistema MUST exibir status atual de cada processo (Rascunho, Em Revisão, Aprovado, Rejeitado)

### Workflow de Aprovação
- ✅ **FR-006**: Sistema MUST permitir enviar processo para aprovação (status → "Em Revisão")
- ✅ **FR-007**: Sistema MUST permitir que stakeholders aprovem processos
- ✅ **FR-008**: Sistema MUST permitir que stakeholders rejeitem processos com motivo obrigatório
- ✅ **FR-009**: Sistema MUST registrar todas as aprovações e rejeições com timestamp e stakeholder
- ✅ **FR-010**: Sistema MUST permitir refazer processo baseado em feedback de rejeição

### Entidades
- ✅ **FR-011**: Sistema MUST permitir criar, editar e visualizar entidades
- ✅ **FR-012**: Sistema MUST categorizar entidades por tipo (pessoa, empresa, serviço, infraestrutura)
- ✅ **FR-013**: Sistema MUST permitir referenciar entidades em processos
- ✅ **FR-014**: Sistema MUST incluir entidade do condomínio com informações completas (CNPJ, endereço, etc.)

### Autenticação e Autorização
- ✅ **FR-015**: Sistema MUST usar Supabase Auth para autenticação
- ✅ **FR-016**: Sistema MUST implementar RBAC com roles: admin, syndic, subsindico, council, staff, resident
- ✅ **FR-017**: Sistema MUST exigir aprovação de administrador para novos usuários
- ✅ **FR-018**: Sistema MUST permitir apenas moradores acessarem chat inicialmente

### Chat
- ✅ **FR-019**: Sistema MUST fornecer interface de chat para moradores
- ⚠️ **FR-020**: Sistema MUST responder perguntas baseado em processos aprovados (pendente - Spec 005/006)
- ⚠️ **FR-021**: Sistema MUST incluir referências aos processos usados como fonte (pendente)

## Success Criteria

### Measurable Outcomes

- ✅ **SC-001**: 35 processos pré-cadastrados estão disponíveis e organizados corretamente
- ✅ **SC-002**: Stakeholders conseguem aprovar ou rejeitar processo em menos de 2 minutos
- ✅ **SC-003**: 100% das rejeições incluem motivo obrigatório
- ✅ **SC-004**: Criador consegue refazer processo baseado em motivos de rejeição
- ✅ **SC-005**: Sistema mantém 100% de rastreabilidade de todas as aprovações e versões
- ✅ **SC-006**: Dashboard exibe corretamente status de todos os processos
- ⚠️ **SC-007**: Chat responde perguntas baseado em processos aprovados (pendente - Spec 005/006)

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
- ⚠️ Base de Conhecimento e RAG (Spec 005) - para chat completo
- ⚠️ LLM API (Spec 006) - para chat completo

## Out of Scope

### Nunca Fará Parte do Sistema

As seguintes funcionalidades **nunca farão parte do sistema**:

- ❌ **Controle de acesso físico** (biometria, câmeras, sistemas de segurança física)
- ❌ **Portaria online integrada** (integração operacional com sistemas de portaria)

**Justificativa**: O sistema foca exclusivamente em **gestão documental de processos**, não em operação direta de sistemas físicos ou integração com sistemas de segurança/portaria.

### Possíveis Features Futuras

As seguintes funcionalidades **podem fazer parte de versões futuras**, mas não estão no escopo atual:

- 🔮 **Acompanhamento Orçamentário** (módulo futuro)
  - Previsão orçamentária anual
  - Acompanhamento de execução orçamentária
  - Comparativo orçado vs realizado
  - Prestação de contas (relatórios)
  
  **Importante**: Este seria um módulo de **acompanhamento e transparência**, não de gestão operacional. Contas a pagar e receber, geração de boletos e controle de inadimplência são de **responsabilidade da administradora**. O sistema apenas acompanharia a execução orçamentária com base em informações fornecidas pela administradora.
  
  **Ver documento completo**: `docs/ESCOPO_FINANCEIRO.md`
- 🔮 Gestão operacional de manutenção predial
- 🔮 Sistema de reservas operacional de áreas comuns
- 🔮 Gestão operacional de pets e eventos
- 🔮 Sistema operacional de emergências

**Nota**: Estas funcionalidades podem ser implementadas no futuro como módulos separados, mas não fazem parte do MVP atual que foca em **gestão documental de processos**.

## Próximos Passos

1. ⚠️ Implementar Base de Conhecimento (Spec 005) - crítico para chat
2. ⚠️ Completar Chatbot Inteligente (Spec 006) - integrar RAG + LLM
3. ⚠️ Implementar Validação de Entidades (Spec 004) - melhorar qualidade dos dados
4. ⚠️ Considerar Ingestão de Contratos (Spec 007) - funcionalidade avançada

## Referências

- **Spec Original (Arquivada)**: `specs/archive/001-condominio-gestao-inteligente-ORIGINAL.md`
- **Spec 003**: `specs/003-app-gestao-processos-aprovacao/spec.md` (implementação detalhada)
- **Estado Atual**: `docs/ESTADO_ATUAL_PROJETO.md`
