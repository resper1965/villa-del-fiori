# Tasks: Ingestão de Contratos de Fornecedores

**Feature**: `007-ingestao-contratos-fornecedores`

## Phase 0: Infraestrutura

- [ ] Adicionar dependências: `openai`, `pdfplumber`, `python-docx`, `boto3`, `python-multipart`
- [ ] Configurar variáveis de ambiente (OPENAI_API_KEY, S3_BUCKET, etc.)
- [ ] Criar serviço de storage abstrato (S3 + local)
- [ ] Criar migração Alembic para novas tabelas

## Phase 1: Upload de Contratos

### Backend
- [ ] Criar modelo `Contract` em `models/contract.py`
- [ ] Criar schemas Pydantic em `schemas/contract.py`
- [ ] Implementar `document_extraction_service.py` (PDF + DOCX)
- [ ] Implementar `contract_service.py` (upload, listagem)
- [ ] Criar endpoints em `api/v1/endpoints/contracts.py`:
  - [ ] `POST /contracts/upload`
  - [ ] `GET /contracts`
  - [ ] `GET /contracts/{id}`
  - [ ] `PATCH /contracts/{id}`

### Frontend
- [ ] Criar página `/contracts` (listagem)
- [ ] Criar página `/contracts/upload`
- [ ] Criar componente `ContractUpload.tsx` (drag-and-drop)
- [ ] Criar cliente API `lib/api/contracts.ts`

### Testes
- [ ] Testar extração de PDF
- [ ] Testar extração de DOCX
- [ ] Testar upload de arquivo

## Phase 2: Análise por IA

### Backend
- [ ] Criar modelo `ContractAnalysis`
- [ ] Criar modelo `SuggestedProcess`
- [ ] Implementar `ai_analysis_service.py`:
  - [ ] Configurar cliente OpenAI
  - [ ] Criar prompts de análise
  - [ ] Implementar `analyze_contract()`
  - [ ] Implementar `identify_supplier()`
  - [ ] Implementar `suggest_processes()`
- [ ] Criar endpoints:
  - [ ] `POST /contracts/{id}/analyze`
  - [ ] `GET /contracts/{id}/analysis`
  - [ ] `GET /contracts/{id}/suggested-processes`

### Frontend
- [ ] Criar componente `ContractAnalysisView.tsx`
- [ ] Criar componente `SuggestedProcessList.tsx`
- [ ] Implementar polling de status de análise

### Testes
- [ ] Testar parsing de resposta GPT-4
- [ ] Testar cálculo de confidence score
- [ ] Mockar chamadas OpenAI

## Phase 3: Mapeamento de Workflow

### Backend
- [ ] Expandir `ai_analysis_service.py`:
  - [ ] `generate_workflow_steps()`
  - [ ] `generate_mermaid_diagram()`
- [ ] Criar templates de workflow por categoria
- [ ] Implementar validação de sintaxe Mermaid

### Frontend
- [ ] Criar componente `WorkflowPreview.tsx`
- [ ] Integrar renderização Mermaid
- [ ] Permitir edição de etapas

### Testes
- [ ] Testar geração de workflow
- [ ] Testar sintaxe Mermaid

## Phase 4: Matriz RACI

### Backend
- [ ] Expandir `ai_analysis_service.py`:
  - [ ] `generate_raci_matrix()`
- [ ] Integrar validação de entidades (spec 004)
- [ ] Identificar entidades faltantes

### Frontend
- [ ] Criar componente `RACIPreview.tsx`
- [ ] Destacar entidades faltantes
- [ ] Modal de criação rápida de entidade

### Testes
- [ ] Testar geração de RACI
- [ ] Testar detecção de entidades faltantes

## Phase 5: Geração de Processo

### Backend
- [ ] Implementar `process_generation_service.py`:
  - [ ] `generate_process_from_suggestion()`
  - [ ] Preencher todos os campos do template
  - [ ] Vincular ao contrato
- [ ] Criar endpoints:
  - [ ] `POST /contracts/{id}/suggested-processes/{sp_id}/accept`
  - [ ] `POST /contracts/{id}/suggested-processes/{sp_id}/reject`
  - [ ] `POST /contracts/{id}/generate`

### Frontend
- [ ] Criar componente `ProcessPreview.tsx`
- [ ] Implementar fluxo de aceitar/rejeitar
- [ ] Tela de confirmação de geração

### Testes
- [ ] Testar geração de processo completo
- [ ] Testar validação de campos

## Phase 6: Rastreabilidade

### Backend
- [ ] Adicionar `source_contract_id` ao modelo Process
- [ ] Adicionar `is_ai_generated` ao modelo Process
- [ ] Criar modelo `ContractHistory`
- [ ] Criar endpoints:
  - [ ] `GET /contracts/{id}/processes`
  - [ ] `GET /contracts/{id}/history`

### Frontend
- [ ] Criar página `/contracts/[id]` (detalhes)
- [ ] Exibir timeline de eventos
- [ ] Adicionar badge "IA" nos processos
- [ ] Links bidirecionais contrato ↔ processos

## Phase 7: Dashboard

### Backend
- [ ] Criar endpoint `GET /contracts/dashboard`:
  - [ ] Total por status
  - [ ] Taxa de aceitação
  - [ ] Processos por categoria
  - [ ] Tempo médio de processamento

### Frontend
- [ ] Criar cards de métricas
- [ ] Gráficos de uso
- [ ] Lista de contratos recentes
- [ ] Filtros por período

## Checklist Final

- [ ] Todos os endpoints documentados no OpenAPI
- [ ] Testes de integração passando
- [ ] UI responsiva
- [ ] Tratamento de erros
- [ ] Logs de auditoria
- [ ] Cache de análises implementado
- [ ] Rate limiting para endpoints de IA
