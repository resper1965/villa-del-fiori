# Plano de Desenvolvimento dos Módulos Restantes

**Data**: 2025-01-09  
**Status**: Planejamento  
**Excluído**: Gestão de Pets

## 📋 Visão Geral

Este documento apresenta o plano detalhado de desenvolvimento dos módulos restantes do sistema **Gabi - Síndica Virtual**, priorizados por impacto, dependências e valor de negócio.

## 🎨 Diretrizes de Design e Imagens

**Uso de Imagens**: O sistema utilizará **imagens existentes abstratas** de bibliotecas (Unsplash, Pexels, Flaticon, etc.) ou ícones, **não** gerará imagens usando IA (DALL-E, Midjourney, etc.). As imagens serão:
- Abstratas e genéricas (não específicas do condomínio)
- De bibliotecas gratuitas ou com licença adequada
- Ícones e ilustrações vetoriais quando apropriado
- Usadas para melhorar UX e visualização, não para representar conteúdo específico

## ✅ Módulos Já Implementados

- ✅ **Gestão de Processos Documentados** (Spec 003)
- ✅ **Workflow de Aprovação** (Spec 003)
- ✅ **Base de Conhecimento e RAG** (Spec 005) - Infraestrutura pronta
- ✅ **Chat com RAG** (Spec 006) - Infraestrutura pronta

## 🚀 Módulos a Desenvolver

### 1. Validação de Entidades em Processos (Spec 004) 🔴 PRIORIDADE ALTA

**Status**: ⚠️ Pendente  
**Prioridade**: P0 - Crítico  
**Estimativa**: 1-2 semanas  
**Dependências**: Sistema de processos (✅), Sistema de entidades (✅)

#### Objetivo
Garantir integridade referencial dos processos validando que todas as entidades mencionadas existem e estão completas antes de permitir salvamento.

#### Funcionalidades

1. **Validação Automática ao Criar/Editar Processo**
   - Extrair entidades mencionadas no processo (nome, descrição, workflow, RACI)
   - Verificar se cada entidade existe no banco de dados
   - Verificar se entidades têm informações mínimas necessárias
   - Bloquear salvamento se houver entidades faltantes ou incompletas

2. **Validação em Lote**
   - Validar todos os processos existentes
   - Gerar relatório de processos com entidades faltantes
   - Sugerir correções

3. **Criação Rápida de Entidades**
   - Modal para criar entidade faltante sem sair do processo
   - Preencher automaticamente campos baseado no contexto
   - Vincular automaticamente ao processo após criação

4. **Dashboard de Integridade**
   - Métricas de integridade (processos válidos vs inválidos)
   - Lista de processos com problemas
   - Lista de entidades mais referenciadas
   - Gráficos de integridade ao longo do tempo

#### Tarefas Técnicas

**Backend (Supabase Edge Functions + SQL)**
- [ ] Criar função SQL para extrair entidades de texto (regex + parsing)
- [ ] Criar função SQL para validar existência de entidades
- [ ] Criar Edge Function `validate-process-entities` 
- [ ] Criar Edge Function `validate-all-processes` (batch)
- [ ] Criar tabela `entity_validation_results` para cache
- [ ] Criar triggers para validação automática

**Frontend**
- [ ] Criar hook `useEntityValidation` para validação em tempo real
- [ ] Adicionar indicadores visuais de validação no formulário
- [ ] Criar modal `CreateEntityQuick` para criação rápida
- [ ] Criar página `Dashboard de Integridade` (`/admin/integrity`)
- [ ] Adicionar validação antes de salvar processo
- [ ] Mostrar lista de entidades faltantes com opção de criar

**Database**
- [ ] Migration: `017_create_entity_validation.sql`
  - Tabela `entity_validation_results`
  - Funções SQL de validação
  - Triggers de validação automática

#### Critérios de Aceitação
- ✅ 100% dos processos validados antes de salvamento
- ✅ 0 processos com entidades faltantes após validação
- ✅ Tempo de validação < 500ms
- ✅ Interface intuitiva para criar entidades faltantes

---

### 2. Acompanhamento Orçamentário (Módulo Financeiro) 🟡 PRIORIDADE MÉDIA

**Status**: ⚠️ Pendente  
**Prioridade**: P1 - Importante  
**Estimativa**: 3-4 semanas  
**Dependências**: Sistema de processos (✅), Sistema de entidades (✅)

#### Objetivo
Permitir que o condomínio acompanhe a execução orçamentária anual, comparando valores previstos com realizados, sem operar financeiramente (contas a pagar/receber são da administradora).

#### Funcionalidades

1. **Previsão Orçamentária Anual**
   - Criar orçamento anual com categorias de despesas
   - Definir valores previstos por categoria e mês
   - Ajustes orçamentários (revisões)
   - Histórico de versões do orçamento

2. **Registro de Execução**
   - Importar dados da administradora (CSV, Excel, ou manual)
   - Registrar despesas realizadas por categoria e mês
   - Registrar receitas realizadas por categoria e mês
   - Validação de dados importados

3. **Acompanhamento e Comparativo**
   - Comparativo orçado vs realizado por categoria
   - Comparativo orçado vs realizado por mês
   - Análise de variações (positivas e negativas)
   - Percentual de execução orçamentária

4. **Prestação de Contas**
   - Relatórios mensais (receitas, despesas, saldo)
   - Relatórios anuais consolidados
   - Gráficos e visualizações (barras, linhas, pizza)
   - Exportação para PDF/Excel

5. **Alertas e Notificações**
   - Alertas de desvios orçamentários significativos
   - Alertas de categorias próximas do limite
   - Notificações mensais de execução

#### Tarefas Técnicas

**Database**
- [ ] Migration: `018_create_budget_tables.sql`
  - Tabela `budgets` (orçamentos anuais)
  - Tabela `budget_categories` (categorias de despesas/receitas)
  - Tabela `budget_items` (itens do orçamento: categoria, mês, valor previsto)
  - Tabela `budget_executions` (execução: categoria, mês, valor realizado)
  - Tabela `budget_versions` (histórico de versões)

**Backend (Supabase Edge Functions)**
- [ ] Edge Function `import-budget-execution` (importar CSV/Excel)
- [ ] Edge Function `calculate-budget-variance` (calcular variações)
- [ ] Edge Function `generate-budget-report` (gerar relatórios)
- [ ] Funções SQL para cálculos de comparativo

**Frontend**
- [ ] Página `Orçamento` (`/budget`)
  - Visualização de orçamento anual
  - Formulário de criação/edição de orçamento
  - Tabela de categorias e valores
- [ ] Página `Execução Orçamentária` (`/budget/execution`)
  - Importação de dados
  - Registro manual de despesas/receitas
  - Comparativo orçado vs realizado
- [ ] Página `Prestação de Contas` (`/budget/reports`)
  - Relatórios mensais e anuais
  - Gráficos e visualizações
  - Exportação PDF/Excel
- [ ] Componentes:
  - `BudgetChart` (gráficos de execução)
  - `BudgetTable` (tabela comparativa)
  - `BudgetImport` (importação de dados)
  - `BudgetAlert` (alertas de desvios)

#### Critérios de Aceitação
- ✅ Criar e editar orçamento anual completo
- ✅ Importar execução orçamentária da administradora
- ✅ Visualizar comparativo orçado vs realizado
- ✅ Gerar relatórios mensais e anuais
- ✅ Alertas automáticos de desvios

#### Notas Importantes
- **NÃO** gerencia contas a pagar/receber (responsabilidade da administradora)
- **NÃO** gera boletos (responsabilidade da administradora)
- **NÃO** controla inadimplência (responsabilidade da administradora)
- Apenas **acompanha** e **presta contas** da execução orçamentária

---

### 3. Gestão de Manutenção Predial 🟢 PRIORIDADE MÉDIA

**Status**: ⚠️ Pendente  
**Prioridade**: P1 - Importante  
**Estimativa**: 3-4 semanas  
**Dependências**: Sistema de processos (✅), Sistema de entidades (✅)

#### Objetivo
Gerenciar manutenções preventivas e corretivas do condomínio, incluindo agendamento, ordens de serviço, histórico e gestão de fornecedores.

#### Funcionalidades

1. **Agendamento de Manutenções Preventivas**
   - Cadastrar manutenções recorrentes (mensal, trimestral, anual)
   - Agendar manutenções preventivas
   - Notificações de manutenções próximas
   - Checklist de manutenção

2. **Ordens de Serviço**
   - Criar ordem de serviço para manutenção corretiva
   - Vincular a fornecedor/entidade
   - Acompanhar status (aberta, em andamento, concluída)
   - Upload de fotos reais dos problemas (fotos tiradas pelos usuários, não geradas)
   - Anexar documentos

3. **Histórico de Manutenções**
   - Histórico completo de todas as manutenções
   - Filtros por tipo, fornecedor, período
   - Custo total por período
   - Análise de frequência de manutenções

4. **Gestão de Fornecedores de Manutenção**
   - Cadastrar fornecedores especializados
   - Avaliar fornecedores (notas, comentários)
   - Histórico de serviços prestados
   - Contratos vinculados

#### Tarefas Técnicas

**Database**
- [ ] Migration: `019_create_maintenance_tables.sql`
  - Tabela `maintenance_schedules` (agendamentos preventivos)
  - Tabela `maintenance_work_orders` (ordens de serviço)
  - Tabela `maintenance_history` (histórico)
  - Tabela `maintenance_checklists` (checklists)
  - Tabela `maintenance_supplier_ratings` (avaliações)

**Backend**
- [ ] Edge Function `create-maintenance-schedule`
- [ ] Edge Function `create-work-order`
- [ ] Edge Function `update-work-order-status`
- [ ] Edge Function `notify-upcoming-maintenance`

**Frontend**
- [ ] Página `Manutenções` (`/maintenance`)
  - Lista de manutenções agendadas
  - Calendário de manutenções
  - Formulário de criação de ordem de serviço
  - Upload de fotos reais (não geradas)
- [ ] Página `Histórico de Manutenções` (`/maintenance/history`)
  - Histórico completo
  - Filtros e busca
  - Gráficos de custos
- [ ] Componentes:
  - `MaintenanceCalendar` (calendário)
  - `WorkOrderForm` (formulário de ordem)
  - `MaintenanceHistory` (histórico)
  - `MaintenanceChart` (gráficos)
  - `ImageUpload` (upload de fotos reais - não geração de imagens)

#### Critérios de Aceitação
- ✅ Agendar manutenções preventivas recorrentes
- ✅ Criar e acompanhar ordens de serviço
- ✅ Visualizar histórico completo
- ✅ Notificações de manutenções próximas

---

### 4. Sistema de Reservas de Áreas Comuns 🟢 PRIORIDADE MÉDIA

**Status**: ⚠️ Pendente  
**Prioridade**: P1 - Importante  
**Estimativa**: 2-3 semanas  
**Dependências**: Sistema de processos (✅), Sistema de entidades (✅)

#### Objetivo
Permitir que moradores reservem áreas comuns (academia, SPA, salão de festas, quadra, etc.) com controle de horários, disponibilidade e prevenção de conflitos.

#### Funcionalidades

1. **Cadastro de Áreas Comuns**
   - Cadastrar áreas disponíveis para reserva
   - Definir horários de funcionamento
   - Definir regras de reserva (antecipação mínima, duração máxima)
   - Capacidade máxima de pessoas
   - **Imagem ilustrativa**: Usar imagens abstratas existentes de bibliotecas (ex: ícone de academia, SPA, salão de festas) - **não gerar imagens com IA**

2. **Sistema de Reservas**
   - Moradores podem reservar áreas
   - Verificar disponibilidade em tempo real
   - Prevenir conflitos de horário
   - Cancelar reservas

3. **Aprovação de Reservas** (opcional)
   - Reservas podem precisar de aprovação (dependendo da área)
   - Notificações de aprovação/rejeição
   - Histórico de reservas

4. **Gestão e Relatórios**
   - Calendário de reservas
   - Relatórios de uso por área
   - Análise de áreas mais utilizadas
   - Histórico de reservas por morador

#### Tarefas Técnicas

**Database**
- [ ] Migration: `020_create_reservations_tables.sql`
  - Tabela `common_areas` (áreas comuns)
  - Tabela `reservations` (reservas)
  - Tabela `reservation_rules` (regras de reserva)
  - Tabela `reservation_approvals` (aprovações, se necessário)

**Backend**
- [ ] Edge Function `check-availability` (verificar disponibilidade)
- [ ] Edge Function `create-reservation`
- [ ] Edge Function `cancel-reservation`
- [ ] Edge Function `approve-reservation` (se necessário)
- [ ] Funções SQL para verificar conflitos

**Frontend**
- [ ] Página `Reservas` (`/reservations`)
  - Lista de áreas comuns
  - Calendário de disponibilidade
  - Formulário de reserva
  - Imagens ilustrativas abstratas de áreas (ícones/bibliotecas, não geradas)
- [ ] Página `Minhas Reservas` (`/reservations/my-reservations`)
  - Reservas do morador
  - Histórico
  - Cancelamento
- [ ] Página `Gestão de Reservas` (`/admin/reservations`) - para administradores
  - Todas as reservas
  - Aprovações pendentes
  - Relatórios
- [ ] Componentes:
  - `ReservationCalendar` (calendário)
  - `AreaCard` (card de área com imagem abstrata)
  - `ReservationForm` (formulário)
  - `AvailabilityChecker` (verificador de disponibilidade)

#### Critérios de Aceitação
- ✅ Moradores podem reservar áreas comuns
- ✅ Sistema previne conflitos de horário
- ✅ Visualização de disponibilidade em tempo real
- ✅ Cancelamento de reservas
- ✅ Relatórios de uso

---

### 5. Gestão de Eventos 🟢 PRIORIDADE MÉDIA

**Status**: ⚠️ Pendente  
**Prioridade**: P1 - Importante  
**Estimativa**: 2-3 semanas  
**Dependências**: Sistema de reservas (⚠️), Sistema de processos (✅)

#### O Que É Gestão de Eventos?

**Gestão de Eventos** no contexto condominial refere-se ao sistema que permite:

1. **Criação e Organização de Eventos**
   - Moradores e administração podem criar eventos (festas, reuniões, atividades)
   - Definir data, horário, local (área comum)
   - Descrição, público-alvo, número de participantes esperados

2. **Divulgação e Comunicação**
   - Divulgar eventos para todos os moradores
   - Notificações de eventos próximos
   - Confirmação de presença (opcional)

3. **Integração com Reservas**
   - Eventos podem reservar áreas comuns automaticamente
   - Prevenir conflitos com outras reservas
   - Gestão de recursos necessários (mesas, cadeiras, som)

4. **Histórico e Relatórios**
   - Histórico de eventos realizados
   - Análise de participação
   - Calendário de eventos

#### Funcionalidades Detalhadas

1. **Criação de Eventos**
   - Formulário de criação (título, descrição, data, horário, local)
   - Seleção de área comum (integração com sistema de reservas)
   - Definição de público-alvo (todos, moradores, convidados)
   - Estimativa de participantes
   - Recursos necessários (mesas, cadeiras, som, etc.)
   - **Imagem ilustrativa**: Usar imagens abstratas existentes de bibliotecas (ex: ícones de festa, reunião, evento) - **não gerar imagens com IA**

2. **Divulgação**
   - Lista de eventos públicos
   - Calendário de eventos
   - Notificações push/email de eventos próximos
   - Confirmação de presença (opcional)

3. **Aprovação de Eventos** (se necessário)
   - Eventos podem precisar de aprovação da administração
   - Notificações de aprovação/rejeição
   - Justificativa de rejeição

4. **Gestão e Relatórios**
   - Calendário de eventos
   - Histórico de eventos
   - Análise de participação
   - Relatórios de eventos por período

#### Tarefas Técnicas

**Database**
- [ ] Migration: `021_create_events_tables.sql`
  - Tabela `events` (eventos)
  - Tabela `event_attendees` (confirmados, se houver)
  - Tabela `event_resources` (recursos necessários)
  - Tabela `event_approvals` (aprovações, se necessário)

**Backend**
- [ ] Edge Function `create-event`
- [ ] Edge Function `approve-event` (se necessário)
- [ ] Edge Function `notify-upcoming-events`
- [ ] Edge Function `confirm-attendance` (se houver confirmação)
- [ ] Integração com sistema de reservas

**Frontend**
- [ ] Página `Eventos` (`/events`)
  - Lista de eventos
  - Calendário de eventos
  - Formulário de criação
  - Imagens ilustrativas abstratas de eventos (ícones/bibliotecas, não geradas)
- [ ] Página `Meus Eventos` (`/events/my-events`)
  - Eventos criados pelo usuário
  - Eventos confirmados (se houver confirmação)
- [ ] Página `Gestão de Eventos` (`/admin/events`) - para administradores
  - Todos os eventos
  - Aprovações pendentes
  - Relatórios
- [ ] Componentes:
  - `EventCalendar` (calendário)
  - `EventCard` (card de evento com imagem abstrata)
  - `EventForm` (formulário)
  - `EventDetails` (detalhes)

#### Critérios de Aceitação
- ✅ Criar e divulgar eventos
- ✅ Integração com sistema de reservas
- ✅ Calendário de eventos
- ✅ Notificações de eventos próximos
- ✅ Aprovação de eventos (se necessário)

---

### 6. Sistema de Emergências 🟡 PRIORIDADE BAIXA

**Status**: ⚠️ Pendente  
**Prioridade**: P2 - Futuro  
**Estimativa**: 2-3 semanas  
**Dependências**: Sistema de processos (✅), Sistema de entidades (✅)

#### Objetivo
Gerenciar procedimentos de emergência, contatos de emergência, registro de incidentes e alertas.

#### Funcionalidades

1. **Procedimentos de Emergência**
   - Documentar procedimentos para diferentes tipos de emergência
   - Acesso rápido a procedimentos
   - Checklist de ações em emergência

2. **Contatos de Emergência**
   - Cadastrar contatos de emergência (bombeiros, polícia, hospital, etc.)
   - Contatos internos (síndico, zelador, etc.)
   - Acesso rápido a contatos

3. **Registro de Incidentes**
   - Registrar incidentes ocorridos
   - Classificar tipo de incidente
   - Upload de fotos reais dos incidentes (fotos tiradas pelos usuários, não geradas)
   - Anexar documentos
   - Histórico de incidentes

4. **Alertas e Notificações**
   - Alertas de emergência para todos os moradores
   - Notificações de incidentes
   - Histórico de alertas

#### Tarefas Técnicas

**Database**
- [ ] Migration: `022_create_emergency_tables.sql`
  - Tabela `emergency_procedures` (procedimentos)
  - Tabela `emergency_contacts` (contatos)
  - Tabela `emergency_incidents` (incidentes)
  - Tabela `emergency_alerts` (alertas)

**Backend**
- [ ] Edge Function `create-incident`
- [ ] Edge Function `send-emergency-alert`
- [ ] Edge Function `get-emergency-contacts`

**Frontend**
- [ ] Página `Emergências` (`/emergency`)
  - Procedimentos de emergência
  - Contatos de emergência
  - Formulário de registro de incidente
  - Upload de fotos reais de incidentes (não geradas)
- [ ] Página `Histórico de Incidentes` (`/emergency/incidents`)
  - Histórico completo
  - Filtros e busca
- [ ] Componentes:
  - `EmergencyProcedures` (procedimentos)
  - `EmergencyContacts` (contatos)
  - `IncidentForm` (formulário)
  - `EmergencyAlert` (alertas)
  - `ImageUpload` (upload de fotos reais - não geração de imagens)

#### Critérios de Aceitação
- ✅ Acesso rápido a procedimentos e contatos
- ✅ Registrar incidentes
- ✅ Enviar alertas de emergência
- ✅ Histórico de incidentes

---

### 7. Ingestão de Contratos de Fornecedores (Spec 007) 🟢 PRIORIDADE BAIXA

**Status**: ⚠️ Pendente  
**Prioridade**: P2 - Futuro  
**Estimativa**: 4-5 semanas  
**Dependências**: Spec 004 (⚠️), Spec 005 (✅), LLM API

#### Objetivo
Ingerir contratos de fornecedores e gerar automaticamente processos baseados na análise por IA.

#### Funcionalidades

1. **Upload de Contratos**
   - Upload de PDF, DOC, DOCX
   - Validação de formato
   - Armazenamento seguro

2. **Análise por IA**
   - Extração de texto
   - Análise de conteúdo por LLM
   - Identificação de cláusulas importantes
   - Inferência de processos relacionados

3. **Geração Automática de Processos**
   - Gerar processo baseado no contrato
   - Inferir workflow e RACI
   - Vincular a fornecedor/entidade
   - Sugerir categorias e variáveis

4. **Gestão de Contratos**
   - Lista de contratos
   - Histórico de análises
   - Processos gerados
   - Renovação e vencimento

#### Tarefas Técnicas

**Database**
- [ ] Migration: `023_create_contracts_tables.sql`
  - Tabela `contracts` (contratos)
  - Tabela `contract_analyses` (análises)
  - Tabela `suggested_processes` (processos sugeridos)

**Backend**
- [ ] Edge Function `upload-contract`
- [ ] Edge Function `analyze-contract` (chama LLM)
- [ ] Edge Function `generate-process-from-contract`
- [ ] Integração com serviço de extração de texto

**Frontend**
- [ ] Página `Contratos` (`/contracts`)
  - Lista de contratos
  - Upload de contratos
  - Análises e processos gerados
- [ ] Componentes:
  - `ContractUpload` (upload)
  - `ContractAnalysis` (análise)
  - `SuggestedProcess` (processo sugerido)

#### Critérios de Aceitação
- ✅ Upload e análise de contratos
- ✅ Geração automática de processos
- ✅ Vinculação a fornecedores
- ✅ Histórico de análises

---

## 📅 Cronograma Sugerido

### Fase 1: Fundação (Semanas 1-2)
- ✅ Spec 004: Validação de Entidades

### Fase 2: Módulos Operacionais (Semanas 3-8)
- ✅ Spec 007: Ingestão de Contratos (paralelo com outros)
- ✅ Módulo Financeiro: Acompanhamento Orçamentário
- ✅ Gestão de Manutenção Predial

### Fase 3: Módulos de Convivência (Semanas 9-12)
- ✅ Sistema de Reservas de Áreas Comuns
- ✅ Gestão de Eventos

### Fase 4: Módulos de Segurança (Semanas 13-14)
- ✅ Sistema de Emergências

---

## 🎯 Priorização Final

### Prioridade P0 (Crítico)
1. **Validação de Entidades** (Spec 004) - 1-2 semanas

### Prioridade P1 (Importante)
2. **Acompanhamento Orçamentário** - 3-4 semanas
3. **Gestão de Manutenção Predial** - 3-4 semanas
4. **Sistema de Reservas** - 2-3 semanas
5. **Gestão de Eventos** - 2-3 semanas

### Prioridade P2 (Futuro)
6. **Sistema de Emergências** - 2-3 semanas
7. **Ingestão de Contratos** (Spec 007) - 4-5 semanas

---

## 📊 Métricas de Sucesso

### Validação de Entidades
- ✅ 100% dos processos validados antes de salvamento
- ✅ 0 processos com entidades faltantes

### Acompanhamento Orçamentário
- ✅ Importação de dados em < 30s
- ✅ Relatórios gerados em < 5s
- ✅ 100% de transparência orçamentária

### Gestão de Manutenção
- ✅ 100% das manutenções preventivas agendadas
- ✅ Tempo médio de resposta a ordens de serviço < 24h

### Sistema de Reservas
- ✅ 0 conflitos de reserva
- ✅ Reservas criadas em < 30s

### Gestão de Eventos
- ✅ 100% dos eventos divulgados
- ✅ Calendário sempre atualizado

---

## 🔗 Referências

- **Roadmap**: `docs/ROADMAP.md`
- **Estado Atual**: `docs/ESTADO_ATUAL_PROJETO.md`
- **Escopo Final**: `docs/ESCOPO_FINAL.md`
- **Escopo Financeiro**: `docs/ESCOPO_FINANCEIRO.md`
- **Specs**: `specs/`


