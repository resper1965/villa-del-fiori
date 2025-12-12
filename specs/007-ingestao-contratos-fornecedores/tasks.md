# Tasks: Ingestão de Contratos de Fornecedores

**Feature**: `007-ingestao-contratos-fornecedores`  
**Date**: 2024-12-09  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

Tarefas organizadas por fase de implementação, seguindo o plano técnico.

---

## Phase 0: Preparação e Infraestrutura

### T0.1 - Configurar Dependências
- [ ] Adicionar dependências Deno nas Edge Functions:
  - `openai` (via npm ou deno.land/x)
  - Bibliotecas Deno para extração de PDF/DOCX
- [ ] Configurar import map para Edge Functions
- [ ] Verificar compatibilidade com Supabase Edge Functions runtime

### T0.2 - Configurar Variáveis de Ambiente
- [ ] Adicionar variáveis de ambiente no Supabase Dashboard:
  ```
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-4o-mini
  ```
- [ ] Configurar Supabase Storage bucket para contratos
- [ ] Configurar políticas de acesso ao Storage

### T0.3 - Configurar Storage de Arquivos
- [ ] Criar bucket no Supabase Storage para contratos
- [ ] Configurar políticas RLS no Storage
- [ ] Implementar funções de upload/download usando Supabase Storage client

### T0.4 - Criar Migração de Banco de Dados
- [ ] Criar arquivo `supabase/migrations/XXX_create_contracts_tables.sql`
- [ ] Implementar CREATE TABLE conforme data-model.md
- [ ] Adicionar índices e constraints
- [ ] Aplicar migração via Supabase Dashboard ou MCP
- [ ] Verificar tabelas criadas

---

## Phase 1: Ingestão de Contratos (US-1)

### T1.1 - Criar Tabela Contract
- [ ] Criar migration SQL para tabela `contracts`
- [ ] Implementar todos os campos conforme data-model.md
- [ ] Criar enums `ContractStatus`, `ContractType` no PostgreSQL
- [ ] Adicionar foreign keys e relacionamentos
- [ ] Adicionar índices para performance

### T1.2 - Criar Tipos TypeScript
- [ ] Criar `frontend/src/types/contract.ts`
- [ ] Implementar interfaces `Contract`, `ContractCreate`, `ContractResponse`
- [ ] Implementar `ContractUploadResponse`
- [ ] Implementar `ContractListResponse` (paginado)
- [ ] Adicionar validações Zod (se necessário)

### T1.3 - Implementar Serviço de Extração de Documentos
- [ ] Criar Edge Function `extract-document-text`
- [ ] Implementar `extract_text_from_pdf()` usando bibliotecas Deno
- [ ] Implementar `extract_text_from_docx()` usando bibliotecas Deno
- [ ] Implementar `extract_text()` com roteamento por tipo
- [ ] Implementar extração de metadados (páginas, palavras, etc.)
- [ ] Adicionar tratamento de erros

### T1.4 - Implementar Edge Function de Contratos
- [ ] Criar Edge Function `upload-contract`
- [ ] Implementar upload:
  - Validar arquivo (tipo, tamanho)
  - Salvar no Supabase Storage
  - Calcular hash
  - Criar registro no banco via Supabase client
  - Iniciar extração de texto (chamar outra Edge Function)
- [ ] Criar Edge Function `get-contracts` com paginação e filtros
- [ ] Criar Edge Function `get-contract` para buscar por ID
- [ ] Criar Edge Function `update-contract` para atualizar metadados

### T1.5 - Criar Edge Functions de Contrato
- [ ] Criar Edge Function `upload-contract`:
  - Receber arquivo via FormData
  - Validar autenticação via Supabase Auth
  - Validar permissões do usuário
  - Processar upload
- [ ] Criar Edge Function `get-contracts` com paginação
- [ ] Criar Edge Function `get-contract` para buscar por ID
- [ ] Criar Edge Function `update-contract` para atualizar metadados

### T1.6 - Criar Tabela de Histórico
- [ ] Criar migration SQL para tabela `contract_history`
- [ ] Implementar trigger para registro automático de eventos
- [ ] Criar função SQL `log_contract_event()`

### T1.7 - Testes - Extração
- [ ] Criar testes para Edge Function `extract-document-text`
- [ ] Testar extração de PDF simples
- [ ] Testar extração de DOCX
- [ ] Testar arquivo corrompido
- [ ] Testar arquivo muito grande

### T1.8 - Frontend: Página de Contratos
- [ ] Criar `frontend/src/app/(dashboard)/contracts/page.tsx`
- [ ] Implementar lista de contratos com DataTable
- [ ] Implementar filtros (status, tipo, data)
- [ ] Implementar paginação
- [ ] Adicionar link no menu lateral

### T1.9 - Frontend: Componente de Upload
- [ ] Criar `frontend/src/components/contracts/ContractUpload.tsx`
- [ ] Implementar drag-and-drop com react-dropzone
- [ ] Implementar progress bar de upload
- [ ] Implementar formulário de metadados adicionais
- [ ] Validar tipos de arquivo aceitos

### T1.10 - Frontend: Página de Upload
- [ ] Criar `frontend/src/app/(dashboard)/contracts/upload/page.tsx`
- [ ] Integrar componente de upload
- [ ] Implementar navegação após sucesso

### T1.11 - Frontend: API Client
- [ ] Criar `frontend/src/lib/api/contracts.ts`
- [ ] Implementar `uploadContract()`
- [ ] Implementar `getContracts()`
- [ ] Implementar `getContract()`

---

## Phase 2: Análise por IA (US-2)

### T2.1 - Criar Tabela ContractAnalysis
- [ ] Criar migration SQL para tabela `contract_analysis`
- [ ] Implementar todos os campos conforme data-model.md
- [ ] Criar enum `AnalysisStatus` no PostgreSQL
- [ ] Adicionar foreign keys e relacionamentos

### T2.2 - Criar Tabela SuggestedProcess
- [ ] Criar migration SQL para tabela `suggested_processes`
- [ ] Implementar todos os campos conforme data-model.md
- [ ] Adicionar campos JSONB para workflow e RACI
- [ ] Adicionar foreign keys e relacionamentos

### T2.3 - Criar Tipos TypeScript de Análise
- [ ] Criar `frontend/src/types/contract-analysis.ts`
- [ ] Implementar interfaces `ContractAnalysis`, `ContractAnalysisResponse`
- [ ] Implementar `SuggestedProcess`, `SuggestedProcessResponse`
- [ ] Implementar `AnalysisStatus`

### T2.4 - Implementar Edge Function de Análise por IA
- [ ] Criar Edge Function `analyze-contract`
- [ ] Configurar cliente OpenAI (via npm ou deno.land/x)
- [ ] Implementar prompts de sistema:
  ```typescript
  const SYSTEM_PROMPT = `
  Você é um especialista em gestão de processos condominiais...
  `;
  ```
- [ ] Implementar `analyze_contract()`:
  - Preparar texto do contrato
  - Chamar API OpenAI
  - Parsear resposta JSON
  - Calcular confidence scores
  - Salvar análise no banco via Supabase client
- [ ] Implementar `identify_supplier()`
- [ ] Implementar `identify_services()`
- [ ] Implementar `suggest_process_categories()`
- [ ] Implementar tratamento de rate limits e retries

### T2.5 - Criar Edge Functions de Análise
- [ ] Criar Edge Function `analyze-contract`:
  - `POST /functions/v1/analyze-contract` - Iniciar análise
  - `GET /functions/v1/analyze-contract?contract_id=...` - Obter resultado
- [ ] Implementar processamento assíncrono (Edge Function pode ser chamada de forma assíncrona)
- [ ] Implementar polling de status no frontend

### T2.6 - Testes - Análise IA
- [ ] Criar testes para Edge Function `analyze-contract`
- [ ] Testar parsing de resposta do LLM
- [ ] Testar cálculo de confidence score
- [ ] Testar mapeamento de categorias
- [ ] Mockar chamadas à API OpenAI

### T2.7 - Frontend: Visualização de Análise
- [ ] Criar `frontend/src/components/contracts/ContractAnalysisView.tsx`
- [ ] Implementar status de análise (loading, success, error)
- [ ] Exibir fornecedor identificado
- [ ] Exibir serviços identificados
- [ ] Exibir categorias sugeridas com scores

### T2.8 - Frontend: Lista de Processos Sugeridos
- [ ] Criar `frontend/src/components/contracts/SuggestedProcessList.tsx`
- [ ] Exibir cards com processos sugeridos
- [ ] Exibir confidence score (badge colorido)
- [ ] Exibir justificativa
- [ ] Botões de aceitar/rejeitar

---

## Phase 3: Mapeamento de Workflow (US-3)

### T3.1 - Expandir Serviço de IA para Workflow
- [ ] Adicionar ao `ai_analysis_service.py`:
  - `generate_workflow_steps()` - Gerar etapas numeradas
  - `generate_mermaid_diagram()` - Gerar diagrama
- [ ] Criar prompts específicos para workflow
- [ ] Implementar templates de fallback por categoria

### T3.2 - Criar Templates de Workflow Padrão
- [ ] Criar `backend/src/app/data/workflow_templates.py`
- [ ] Definir template para cada categoria:
  - Governança
  - Acesso e Segurança
  - Operação
  - Áreas Comuns
  - Convivência
  - Eventos
  - Emergências

### T3.3 - Implementar Validação de Mermaid
- [ ] Criar helper `validate_mermaid_syntax()`
- [ ] Corrigir problemas comuns automaticamente
- [ ] Log de erros de sintaxe

### T3.4 - Frontend: Preview do Workflow
- [ ] Criar `frontend/src/components/contracts/WorkflowPreview.tsx`
- [ ] Integrar biblioteca Mermaid para renderização
- [ ] Exibir lista de etapas editável
- [ ] Permitir reordenar etapas (drag-and-drop)
- [ ] Atualizar diagrama em tempo real

### T3.5 - Testes - Geração de Workflow
- [ ] Testar geração de etapas
- [ ] Testar sintaxe Mermaid gerada
- [ ] Testar templates de fallback

---

## Phase 4: Matriz RACI (US-4)

### T4.1 - Expandir Serviço de IA para RACI
- [ ] Adicionar ao `ai_analysis_service.py`:
  - `generate_raci_matrix()` - Gerar matriz completa
- [ ] Criar prompts específicos para RACI
- [ ] Incluir lista de entidades existentes no prompt

### T4.2 - Integrar Validação de Entidades
- [ ] Integrar com `entity_validation_service.py` (spec 004)
- [ ] Identificar entidades faltantes na matriz RACI
- [ ] Adicionar campo `missing_entities` no SuggestedProcess

### T4.3 - Frontend: Preview RACI
- [ ] Criar `frontend/src/components/contracts/RACIPreview.tsx`
- [ ] Exibir tabela com matriz RACI
- [ ] Destacar entidades faltantes (vermelho)
- [ ] Botão para criar entidade faltante (modal)
- [ ] Permitir edição inline

### T4.4 - Testes - RACI
- [ ] Testar geração de matriz RACI
- [ ] Testar detecção de entidades faltantes
- [ ] Testar edição de RACI

---

## Phase 5: Geração de Processo (US-5)

### T5.1 - Implementar Edge Function de Geração de Processo
- [ ] Criar Edge Function `generate-process-from-contract`
- [ ] Implementar `generate_process_from_suggestion()`:
  - Montar objeto Process completo
  - Preencher todos os campos do template
  - Selecionar ícone por categoria
  - Identificar variáveis aplicáveis
  - Definir tipo de documento
  - Criar com status "rascunho" via Supabase client
- [ ] Integrar com validação de entidades (Edge Function `validate-entities`)
- [ ] Registrar vínculo com contrato

### T5.2 - Criar Edge Functions de Geração
- [ ] Criar Edge Function `accept-suggested-process`:
  - `POST /functions/v1/accept-suggested-process`
- [ ] Criar Edge Function `reject-suggested-process`:
  - `POST /functions/v1/reject-suggested-process`
- [ ] Criar Edge Function `generate-processes-from-contract`:
  - `POST /functions/v1/generate-processes-from-contract` (gerar todos aceitos)

### T5.3 - Frontend: Preview de Processo
- [ ] Criar `frontend/src/components/contracts/ProcessPreview.tsx`
- [ ] Exibir preview completo do processo
- [ ] Incluir todos os campos do template
- [ ] Permitir edição antes de confirmar
- [ ] Exibir diagrama Mermaid
- [ ] Exibir matriz RACI

### T5.4 - Frontend: Fluxo de Confirmação
- [ ] Implementar modal de confirmação
- [ ] Validar campos obrigatórios
- [ ] Feedback de sucesso
- [ ] Redirecionar para processo criado

### T5.5 - Testes - Geração de Processo
- [ ] Testar geração de processo completo
- [ ] Testar validação de campos obrigatórios
- [ ] Testar vínculo com contrato
- [ ] Testar integração com processos existentes

---

## Phase 6: Vinculação e Rastreabilidade (US-6)

### T6.1 - Adicionar Campos na Tabela Process
- [ ] Criar migration SQL para adicionar `source_contract_id` à tabela `processes`
- [ ] Adicionar `is_ai_generated` à tabela `processes`
- [ ] Adicionar foreign key para `contracts`
- [ ] Atualizar índices se necessário

### T6.2 - Implementar Edge Functions de Rastreabilidade
- [ ] Criar Edge Function `get-contract-processes`:
  - `GET /functions/v1/get-contract-processes?contract_id=...` - Processos do contrato
- [ ] Criar Edge Function `get-supplier-contracts`:
  - `GET /functions/v1/get-supplier-contracts?supplier_id=...` - Contratos do fornecedor

### T6.3 - Frontend: Navegação Bidirecional
- [ ] Adicionar link para contrato na página de processo
- [ ] Adicionar link para processos na página de contrato
- [ ] Adicionar badge "Gerado por IA" nos processos
- [ ] Exibir timeline de eventos do contrato

### T6.4 - Frontend: Página de Detalhes do Contrato
- [ ] Criar `frontend/src/app/(dashboard)/contracts/[id]/page.tsx`
- [ ] Exibir informações do contrato
- [ ] Exibir texto extraído (collapsible)
- [ ] Exibir análise e sugestões
- [ ] Exibir processos vinculados
- [ ] Exibir timeline de eventos

---

## Phase 7: Integração com Aprovação (US-7)

### T7.1 - Integrar com Workflow de Aprovação
- [ ] Processos gerados devem seguir fluxo existente
- [ ] Adicionar flag `is_ai_generated` na UI de aprovação
- [ ] Exibir link para contrato de origem na revisão

### T7.2 - Implementar Notificações
- [ ] Notificar stakeholders sobre novos processos gerados
- [ ] Incluir origem (contrato) na notificação
- [ ] Destacar como "Processo gerado por IA"

### T7.3 - Frontend: Indicadores na Aprovação
- [ ] Adicionar badge "IA" na lista de processos
- [ ] Mostrar contrato de origem na tela de aprovação
- [ ] Link para ver análise original

---

## Phase 8: Dashboard e Métricas (US-8)

### T8.1 - Implementar Edge Function de Dashboard
- [ ] Criar Edge Function `contracts-dashboard`:
  - `GET /functions/v1/contracts-dashboard`:
  - Total de contratos por status
  - Processos gerados por período
  - Taxa de aceitação de sugestões
  - Tempo médio de processamento
  - Top fornecedores

### T8.2 - Frontend: Dashboard de Contratos
- [ ] Criar cards com métricas principais
- [ ] Implementar gráfico de contratos por mês
- [ ] Implementar gráfico de taxa de aceitação
- [ ] Lista de contratos recentes
- [ ] Filtros por período

### T8.3 - Testes de Integração
- [ ] Criar testes E2E para fluxo completo:
  1. Upload de contrato (via Edge Function)
  2. Extração de texto (via Edge Function)
  3. Análise por IA (via Edge Function)
  4. Sugestão de processos
  5. Aceitação de sugestão (via Edge Function)
  6. Geração de processo (via Edge Function)
  7. Vinculação contrato-processo

---

## Tarefas Adicionais

### Documentação
- [ ] Documentar Edge Functions criadas
- [ ] Documentar prompts de IA
- [ ] Documentar configurações de ambiente (Supabase)
- [ ] Criar guia de uso para usuários

### Segurança
- [ ] Validar permissões de upload
- [ ] Sanitizar nomes de arquivos
- [ ] Validar tipos MIME
- [ ] Rate limiting para endpoints de IA

### Performance
- [ ] Implementar cache para análises
- [ ] Otimizar queries de listagem
- [ ] Implementar processamento em background
- [ ] Monitorar uso de tokens OpenAI

---

## Checklist de Conclusão

### Phase 0
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Storage funcionando
- [ ] Migração executada

### Phase 1
- [ ] Upload de PDF funciona
- [ ] Upload de DOCX funciona
- [ ] Texto é extraído corretamente
- [ ] Lista de contratos funciona
- [ ] UI de upload completa

### Phase 2
- [ ] Análise por IA funciona
- [ ] Fornecedor é identificado
- [ ] Serviços são identificados
- [ ] Categorias são sugeridas
- [ ] UI de análise completa

### Phase 3
- [ ] Workflow é gerado
- [ ] Diagrama Mermaid é válido
- [ ] Templates de fallback funcionam
- [ ] UI de workflow completa

### Phase 4
- [ ] Matriz RACI é gerada
- [ ] Entidades faltantes são detectadas
- [ ] UI de RACI completa

### Phase 5
- [ ] Processo é gerado corretamente
- [ ] Segue template existente
- [ ] Validação de entidades funciona
- [ ] UI de preview completa

### Phase 6
- [ ] Vinculação contrato-processo funciona
- [ ] Rastreabilidade bidirecional
- [ ] Timeline de eventos funciona

### Phase 7
- [ ] Integração com aprovação funciona
- [ ] Notificações são enviadas
- [ ] Badge "IA" visível

### Phase 8
- [ ] Dashboard funciona
- [ ] Métricas são calculadas
- [ ] Filtros funcionam
- [ ] Testes de integração passam
