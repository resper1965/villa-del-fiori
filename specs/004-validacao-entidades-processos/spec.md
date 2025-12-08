# Feature Specification: Validação de Entidades em Processos

**Feature Branch**: `004-validacao-entidades-processos`  
**Created**: 2024-12-08  
**Status**: Draft  
**Input**: User description: "Obrigar a existência de todas as entidades existentes nos processos a existirem com conteúdo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validação de Entidades ao Criar/Editar Processo (Priority: P1)

Sistema deve validar que todas as entidades mencionadas no campo `entities` de um processo existam no cadastro de entidades e tenham dados completos antes de permitir salvar o processo.

**Why this priority**: Garante integridade dos dados e que processos sempre referenciem entidades válidas e completas. Sem essa validação, processos podem referenciar entidades inexistentes ou incompletas, comprometendo a qualidade dos dados.

**Independent Test**: Pode ser testado criando processo com entidades inexistentes, verificando se sistema bloqueia salvamento e exibe mensagens claras. O valor entregue é garantia de consistência de dados.

**Acceptance Scenarios**:

1. **Given** que usuário cria novo processo, **When** adiciona entidades no campo `entities`, **Then** sistema deve validar em tempo real se todas as entidades existem no cadastro
2. **Given** que entidade mencionada não existe, **When** usuário tenta salvar processo, **Then** sistema deve bloquear salvamento e exibir lista de entidades faltantes com opção de criar
3. **Given** que entidade existe mas está incompleta (campos obrigatórios vazios), **When** usuário tenta salvar processo, **Then** sistema deve bloquear e indicar quais campos estão faltando
4. **Given** que todas as entidades existem e estão completas, **When** usuário salva processo, **Then** sistema deve permitir salvamento normalmente

---

### User Story 2 - Validação em Lote de Processos Existentes (Priority: P2)

Sistema deve permitir validar todos os processos existentes de uma vez, identificando processos que referenciam entidades inexistentes ou incompletas.

**Why this priority**: Permite corrigir problemas em processos já criados e manter consistência histórica. Importante para migração e manutenção.

**Independent Test**: Pode ser testado executando validação em lote e verificando relatório de inconsistências. O valor entregue é auditoria e correção de dados existentes.

**Acceptance Scenarios**:

1. **Given** que administrador acessa painel de validação, **When** executa validação em lote, **Then** sistema deve verificar todos os processos e gerar relatório de inconsistências
2. **Given** que processo referencia entidade inexistente, **When** validação é executada, **Then** relatório deve listar processo, entidade faltante e sugerir ações corretivas
3. **Given** que processo referencia entidade incompleta, **When** validação é executada, **Then** relatório deve indicar quais campos estão faltando na entidade
4. **Given** que validação encontra inconsistências, **When** administrador visualiza relatório, **Then** deve poder filtrar por tipo de problema e exportar relatório

---

### User Story 3 - Sugestão e Criação Rápida de Entidades (Priority: P2)

Quando processo referencia entidade inexistente, sistema deve sugerir criação rápida da entidade diretamente do contexto do processo.

**Why this priority**: Melhora UX permitindo criar entidades sem sair do contexto de criação do processo. Reduz fricção no fluxo de trabalho.

**Independent Test**: Pode ser testado tentando adicionar entidade inexistente e verificando se modal de criação rápida aparece. O valor entregue é agilidade no fluxo de trabalho.

**Acceptance Scenarios**:

1. **Given** que usuário adiciona entidade inexistente em processo, **When** sistema detecta, **Then** deve exibir botão "Criar Entidade" ao lado da entidade faltante
2. **Given** que usuário clica em "Criar Entidade", **When** modal abre, **Then** deve pré-preencher nome da entidade e permitir completar campos obrigatórios
3. **Given** que usuário cria entidade pelo modal, **When** salva, **Then** entidade deve ser criada e automaticamente adicionada ao processo
4. **Given** que entidade é criada, **When** processo é salvo, **Then** validação deve passar e processo deve ser salvo com sucesso

---

### User Story 4 - Dashboard de Integridade de Entidades (Priority: P3)

Sistema deve exibir dashboard mostrando status de integridade: quantas entidades estão completas, quantas processos referenciam, e quais entidades não são usadas.

**Why this priority**: Fornece visibilidade sobre saúde dos dados e ajuda na manutenção. Útil para administradores identificarem entidades órfãs ou processos que precisam atualização.

**Independent Test**: Pode ser testado acessando dashboard e verificando se métricas são exibidas corretamente. O valor entregue é visibilidade e governança de dados.

**Acceptance Scenarios**:

1. **Given** que administrador acessa dashboard, **When** visualiza, **Then** deve ver métricas: total de entidades, entidades completas, entidades incompletas, processos validados
2. **Given** que entidade não é referenciada por nenhum processo, **When** dashboard é visualizado, **Then** deve listar entidades órfãs com opção de arquivar
3. **Given** que processo referencia entidade incompleta, **When** dashboard é visualizado, **Then** deve mostrar lista de processos com problemas e permitir correção rápida
4. **Given** que métricas mudam, **When** dashboard é atualizado, **Then** deve refletir mudanças em tempo real

---

## Technical Requirements

### Backend

- Endpoint para validar entidades de um processo antes de salvar
- Endpoint para validação em lote de todos os processos
- Endpoint para obter lista de entidades faltantes ou incompletas
- Endpoint para dashboard de integridade (métricas e estatísticas)
- Validação automática ao criar/editar processo
- Cache de validações para performance

### Frontend

- Validação em tempo real ao adicionar entidades no formulário de processo
- Mensagens de erro claras indicando entidades faltantes
- Modal de criação rápida de entidade
- Página de validação em lote com relatório
- Dashboard de integridade com métricas visuais
- Filtros e exportação de relatórios

### Database

- Índices em campos de entidades para busca rápida
- Query otimizada para validação de múltiplas entidades
- Tabela de cache de validações (opcional)

---

## Non-Functional Requirements

- **Performance**: Validação de processo deve completar em < 500ms
- **Usabilidade**: Mensagens de erro devem ser claras e acionáveis
- **Escalabilidade**: Validação em lote deve processar 100+ processos em < 30s
- **Confiabilidade**: Validação deve ser determinística e sempre retornar mesmo resultado

---

## Dependencies

- Sistema de cadastro de entidades (já existe)
- Sistema de processos (já existe)
- API de validação de dados

---

## Open Questions

1. Deve haver validação automática periódica ou apenas sob demanda?
2. Processos antigos com entidades faltantes devem ser bloqueados ou apenas alertados?
3. Deve haver histórico de validações para auditoria?

