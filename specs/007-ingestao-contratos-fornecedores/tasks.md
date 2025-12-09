# Tasks: Ingestão de Contratos de Fornecedores

**Feature**: `007-ingestao-contratos-fornecedores`  
**Date**: 2024-12-09  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

Tarefas organizadas por fase de implementação, seguindo o plano técnico.

---

## Phase 0: Preparação e Infraestrutura

### T0.1 - Configurar Dependências
- [ ] Adicionar ao `backend/requirements.txt`:
  - `openai>=1.0.0`
  - `pdfplumber>=0.10.0`
  - `python-docx>=1.0.0`
  - `boto3>=1.28.0` (para S3)
  - `python-multipart>=0.0.6` (para upload)
- [ ] Instalar dependências: `pip install -r requirements.txt`
- [ ] Verificar compatibilidade com dependências existentes

### T0.2 - Configurar Variáveis de Ambiente
- [ ] Adicionar ao `.env`:
  ```
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-4
  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  S3_BUCKET_NAME=contracts
  S3_REGION=us-east-1
  # ou para storage local:
  STORAGE_TYPE=local
  LOCAL_STORAGE_PATH=/data/contracts
  ```
- [ ] Atualizar `backend/src/app/core/config.py` com novas configurações

### T0.3 - Configurar Storage de Arquivos
- [ ] Criar serviço de storage abstrato (`storage_service.py`)
- [ ] Implementar adapter para S3
- [ ] Implementar adapter para storage local (dev)
- [ ] Criar pasta de uploads se storage local

### T0.4 - Criar Migração de Banco de Dados
- [ ] Criar arquivo `backend/alembic/versions/004_add_contracts_tables.py`
- [ ] Implementar upgrade() conforme data-model.md
- [ ] Implementar downgrade()
- [ ] Executar migração: `alembic upgrade head`
- [ ] Verificar tabelas criadas

---

## Phase 1: Ingestão de Contratos (US-1)

### T1.1 - Criar Modelo Contract
- [ ] Criar `backend/src/app/models/contract.py`
- [ ] Implementar classe `Contract` com todos os campos
- [ ] Implementar enums `ContractStatus`, `ContractType`
- [ ] Adicionar relacionamentos
- [ ] Registrar no `__init__.py`

### T1.2 - Criar Schemas de Contrato
- [ ] Criar `backend/src/app/schemas/contract.py`
- [ ] Implementar `ContractBase`, `ContractCreate`, `ContractResponse`
- [ ] Implementar `ContractUploadResponse`
- [ ] Implementar `ContractListResponse` (paginado)
- [ ] Adicionar validações Pydantic

### T1.3 - Implementar Serviço de Extração de Documentos
- [ ] Criar `backend/src/app/services/document_extraction_service.py`
- [ ] Implementar `extract_text_from_pdf()` usando pdfplumber
- [ ] Implementar `extract_text_from_docx()` usando python-docx
- [ ] Implementar `extract_text()` com roteamento por tipo
- [ ] Implementar extração de metadados (páginas, palavras, etc.)
- [ ] Adicionar tratamento de erros

### T1.4 - Implementar Serviço de Contratos
- [ ] Criar `backend/src/app/services/contract_service.py`
- [ ] Implementar `upload_contract()`:
  - Validar arquivo (tipo, tamanho)
  - Salvar no storage
  - Calcular hash
  - Criar registro no banco
  - Iniciar extração de texto
- [ ] Implementar `get_contracts()` com paginação e filtros
- [ ] Implementar `get_contract_by_id()`
- [ ] Implementar `update_contract_metadata()`

### T1.5 - Criar Endpoints de Contrato
- [ ] Criar `backend/src/app/api/v1/endpoints/contracts.py`
- [ ] Implementar `POST /contracts/upload`:
  ```python
  @router.post("/upload")
  async def upload_contract(
      file: UploadFile,
      contract_number: str | None = None,
      contract_type: ContractType | None = None,
      current_user: Stakeholder = Depends(get_current_user)
  ):
  ```
- [ ] Implementar `GET /contracts` com paginação
- [ ] Implementar `GET /contracts/{contract_id}`
- [ ] Implementar `PATCH /contracts/{contract_id}` para metadados
- [ ] Registrar router no `api/v1/router.py`

### T1.6 - Criar Modelo e Serviço de Histórico
- [ ] Criar `backend/src/app/models/contract_history.py`
- [ ] Implementar registro automático de eventos
- [ ] Criar helper `log_contract_event()`

### T1.7 - Testes Unitários - Extração
- [ ] Criar `backend/tests/unit/test_document_extraction.py`
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

### T2.1 - Criar Modelo ContractAnalysis
- [ ] Criar `backend/src/app/models/contract_analysis.py`
- [ ] Implementar classe `ContractAnalysis`
- [ ] Implementar enum `AnalysisStatus`
- [ ] Adicionar relacionamentos

### T2.2 - Criar Modelo SuggestedProcess
- [ ] Criar `backend/src/app/models/suggested_process.py`
- [ ] Implementar classe `SuggestedProcess`
- [ ] Adicionar campos JSONB para workflow e RACI
- [ ] Adicionar relacionamentos

### T2.3 - Criar Schemas de Análise
- [ ] Criar `backend/src/app/schemas/analysis.py`
- [ ] Implementar `ContractAnalysisResponse`
- [ ] Implementar `SuggestedProcessResponse`
- [ ] Implementar `AnalysisStatusResponse`

### T2.4 - Implementar Serviço de Análise por IA
- [ ] Criar `backend/src/app/services/ai_analysis_service.py`
- [ ] Configurar cliente OpenAI
- [ ] Implementar prompts de sistema:
  ```python
  SYSTEM_PROMPT = """
  Você é um especialista em gestão de processos condominiais...
  """
  ```
- [ ] Implementar `analyze_contract()`:
  - Preparar texto do contrato
  - Chamar API OpenAI
  - Parsear resposta JSON
  - Calcular confidence scores
  - Salvar análise no banco
- [ ] Implementar `identify_supplier()`
- [ ] Implementar `identify_services()`
- [ ] Implementar `suggest_process_categories()`
- [ ] Implementar tratamento de rate limits e retries

### T2.5 - Criar Endpoints de Análise
- [ ] Adicionar ao `contracts.py`:
  - `POST /contracts/{id}/analyze` - Iniciar análise
  - `GET /contracts/{id}/analysis` - Obter resultado
- [ ] Implementar processamento assíncrono (background task)
- [ ] Implementar polling de status

### T2.6 - Testes Unitários - Análise IA
- [ ] Criar `backend/tests/unit/test_ai_analysis.py`
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

### T5.1 - Implementar Serviço de Geração de Processo
- [ ] Criar `backend/src/app/services/process_generation_service.py`
- [ ] Implementar `generate_process_from_suggestion()`:
  - Montar objeto Process completo
  - Preencher todos os campos do template
  - Selecionar ícone por categoria
  - Identificar variáveis aplicáveis
  - Definir tipo de documento
  - Criar com status "rascunho"
- [ ] Implementar validação de entidades antes de salvar
- [ ] Registrar vínculo com contrato

### T5.2 - Criar Endpoints de Geração
- [ ] Adicionar ao `contracts.py`:
  - `POST /contracts/{id}/suggested-processes/{sp_id}/accept`
  - `POST /contracts/{id}/suggested-processes/{sp_id}/reject`
  - `POST /contracts/{id}/generate` (gerar todos aceitos)

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

### T6.1 - Adicionar Campos no Modelo Process
- [ ] Adicionar `source_contract_id` ao modelo Process
- [ ] Adicionar `is_ai_generated` ao modelo Process
- [ ] Criar migração para alteração
- [ ] Atualizar relacionamentos

### T6.2 - Implementar Endpoints de Rastreabilidade
- [ ] Adicionar ao `contracts.py`:
  - `GET /contracts/{id}/processes` - Processos do contrato
- [ ] Adicionar ao `entities.py`:
  - `GET /entities/{id}/contracts` - Contratos do fornecedor

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

### T8.1 - Implementar Endpoints de Dashboard
- [ ] Criar `GET /contracts/dashboard`:
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
- [ ] Criar `backend/tests/integration/test_contract_workflow.py`
- [ ] Testar fluxo completo:
  1. Upload de contrato
  2. Extração de texto
  3. Análise por IA
  4. Sugestão de processos
  5. Aceitação de sugestão
  6. Geração de processo
  7. Vinculação contrato-processo

---

## Tarefas Adicionais

### Documentação
- [ ] Atualizar OpenAPI com novos endpoints
- [ ] Documentar prompts de IA
- [ ] Documentar configurações de ambiente
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
