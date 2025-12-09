# Tasks: Ingestão de Contratos de Fornecedores com IA

**Input**: Design documents from `/specs/007-ingestao-contratos-fornecedores/`
**Prerequisites**: plan.md ✓, spec.md ✓

**Organization**: Tasks are grouped by user story and implementation phase to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Backend - Upload e Armazenamento (User Story 1)

**Purpose**: Implementar sistema de upload e armazenamento de contratos

- [ ] T001 [US1] Create Contract model in backend/src/app/models/contract.py
- [ ] T002 [US1] Create ContractProcessMapping model in backend/src/app/models/contract.py
- [ ] T003 [US1] Create AIGenerationLog model in backend/src/app/models/contract.py
- [ ] T004 [US1] Create database migration for contracts, contract_process_mappings, ai_generation_logs tables
- [ ] T005 [US1] Create Pydantic schemas for contracts in backend/src/app/schemas/contract.py
- [ ] T006 [US1] Create file storage service in backend/src/app/services/file_storage_service.py
- [ ] T007 [US1] Implement file upload handler with validation (size, type)
- [ ] T008 [US1] Create POST /api/v1/contracts/upload endpoint in backend/src/app/api/v1/endpoints/contracts.py
- [ ] T009 [US1] Create GET /api/v1/contracts endpoint for listing contracts
- [ ] T010 [US1] Create GET /api/v1/contracts/{contract_id} endpoint for contract details
- [ ] T011 [US1] Write unit tests for file upload and storage
- [ ] T012 [US1] Write integration tests for upload endpoint

## Phase 2: Backend - Extração de Texto (User Story 1)

**Purpose**: Extrair texto de diferentes formatos de arquivo

- [ ] T013 [P] [US1] Install and configure PyPDF2/pdfplumber for PDF extraction
- [ ] T014 [P] [US1] Install and configure python-docx for DOCX extraction
- [ ] T015 [US1] Create TextExtractionService in backend/src/app/services/text_extraction_service.py
- [ ] T016 [US1] Implement extract_from_pdf() method
- [ ] T017 [US1] Implement extract_from_docx() method
- [ ] T018 [US1] Implement extract_from_txt() method
- [ ] T019 [US1] Implement text cleaning and normalization
- [ ] T020 [US1] Add OCR support for scanned PDFs (optional, using pytesseract)
- [ ] T021 [US1] Integrate text extraction in contract processing flow
- [ ] T022 [US1] Write unit tests for text extraction
- [ ] T023 [US1] Write integration tests with sample files

## Phase 3: Backend - Integração com IA (User Story 2)

**Purpose**: Integrar com LLM para análise de contratos

- [ ] T024 [US2] Create LLM configuration in backend/src/app/core/llm_config.py
- [ ] T025 [US2] Create LLMService in backend/src/app/services/llm_service.py
- [ ] T026 [US2] Implement support for OpenAI API
- [ ] T027 [US2] Implement support for Anthropic Claude API
- [ ] T028 [US2] Implement support for Ollama (local LLM)
- [ ] T029 [US2] Create prompt templates in backend/src/app/services/prompts/contract_analysis_prompts.py
- [ ] T030 [US2] Implement contract analysis prompt (identify services, responsibilities)
- [ ] T031 [US2] Implement workflow generation prompt
- [ ] T032 [US2] Implement RACI definition prompt
- [ ] T033 [US2] Implement Mermaid diagram generation prompt
- [ ] T034 [US2] Create ContractAnalysisService in backend/src/app/services/contract_analysis_service.py
- [ ] T035 [US2] Implement analyze_contract() method using LLM
- [ ] T036 [US2] Implement parse_ai_response() to extract structured data
- [ ] T037 [US2] Implement error handling and retry logic for LLM calls
- [ ] T038 [US2] Implement token counting and cost tracking
- [ ] T039 [US2] Write unit tests for LLM service (with mocks)
- [ ] T040 [US2] Write integration tests for contract analysis

## Phase 4: Backend - Geração de Processos (User Story 3)

**Purpose**: Gerar processos completos baseado na análise do contrato

- [ ] T041 [US3] Create ProcessGenerationService in backend/src/app/services/process_generation_service.py
- [ ] T042 [US3] Implement generate_workflow() method using LLM
- [ ] T043 [US3] Implement generate_raci_matrix() method using LLM
- [ ] T044 [US3] Implement generate_mermaid_diagram() method using LLM
- [ ] T045 [US3] Implement map_service_to_category() - mapear serviço para categoria de processo
- [ ] T046 [US3] Implement identify_entities() - identificar entidades envolvidas
- [ ] T047 [US3] Implement identify_variables() - identificar variáveis do sistema
- [ ] T048 [US3] Implement create_or_update_supplier_entity() - criar/atualizar entidade fornecedor
- [ ] T049 [US3] Implement generate_process() - gerar processo completo seguindo template
- [ ] T050 [US3] Implement validate_generated_process() - validar processo antes de criar
- [ ] T051 [US3] Integrate with ProcessService to create processes
- [ ] T052 [US3] Link generated processes to contract via ContractProcessMapping
- [ ] T053 [US3] Log all AI generations in AIGenerationLog table
- [ ] T054 [US3] Write unit tests for process generation
- [ ] T055 [US3] Write integration tests for full generation flow

## Phase 5: Backend - Processamento Assíncrono (User Story 2)

**Purpose**: Processar contratos de forma assíncrona

- [ ] T056 [US2] Setup Celery or FastAPI BackgroundTasks for async processing
- [ ] T057 [US2] Create process_contract_task() background task
- [ ] T058 [US2] Implement progress tracking for contract processing
- [ ] T059 [US2] Create POST /api/v1/contracts/{contract_id}/process endpoint
- [ ] T060 [US2] Create GET /api/v1/contracts/{contract_id}/status endpoint
- [ ] T061 [US2] Implement error handling and retry for failed processing
- [ ] T062 [US2] Implement cancellation of processing
- [ ] T063 [US2] Add processing status updates (uploaded, processing, processed, error)
- [ ] T064 [US2] Write tests for async processing

## Phase 6: Backend - APIs de Análise e Revisão (User Stories 4, 5)

**Purpose**: APIs para visualizar análise e revisar processos gerados

- [ ] T065 [US5] Create GET /api/v1/contracts/{contract_id}/analysis endpoint
- [ ] T066 [US5] Create GET /api/v1/contracts/{contract_id}/processes endpoint
- [ ] T067 [US4] Create POST /api/v1/contracts/{contract_id}/processes/{process_id}/review endpoint
- [ ] T068 [US4] Implement approve_generated_process() - aprovar processo gerado
- [ ] T069 [US4] Implement reject_generated_process() - rejeitar processo gerado
- [ ] T070 [US4] Implement edit_generated_process() - editar processo gerado
- [ ] T071 [US6] Create GET /api/v1/contracts/{contract_id}/history endpoint
- [ ] T072 [US6] Create GET /api/v1/processes/{process_id}/generation-log endpoint
- [ ] T073 [US6] Write tests for analysis and review endpoints

## Phase 7: Frontend - Upload de Contratos (User Story 1)

**Purpose**: Interface para upload de contratos

- [ ] T074 [P] [US1] Create ContractUpload component in frontend/src/components/contracts/ContractUpload.tsx
- [ ] T075 [US1] Implement file drag-and-drop interface
- [ ] T076 [US1] Implement file validation (type, size) on frontend
- [ ] T077 [US1] Create upload progress indicator
- [ ] T078 [US1] Create API client functions in frontend/src/lib/api/contracts.ts
- [ ] T079 [US1] Create useContracts hook in frontend/src/lib/hooks/useContracts.ts
- [ ] T080 [US1] Create contracts list page in frontend/src/app/(dashboard)/contracts/page.tsx
- [ ] T081 [US1] Display contracts with status, supplier, upload date
- [ ] T082 [US1] Add filters (status, supplier, date range)
- [ ] T083 [US1] Write E2E tests for upload flow

## Phase 8: Frontend - Visualização de Análise (User Story 5)

**Purpose**: Interface para visualizar análise do contrato

- [ ] T084 [P] [US5] Create ContractAnalysis component in frontend/src/components/contracts/ContractAnalysis.tsx
- [ ] T085 [US5] Display supplier information extracted
- [ ] T086 [US5] Display list of services identified
- [ ] T087 [US5] Display process mappings with confidence scores
- [ ] T088 [US5] Display extracted text from contract
- [ ] T089 [US5] Display responsibilities (supplier vs condominium)
- [ ] T090 [US5] Display key dates (start, end, renewal)
- [ ] T091 [US5] Create contract detail page in frontend/src/app/(dashboard)/contracts/[id]/page.tsx
- [ ] T092 [US5] Add navigation between services and related processes
- [ ] T093 [US5] Write E2E tests for analysis visualization

## Phase 9: Frontend - Revisão de Processos Gerados (User Story 4)

**Purpose**: Interface para revisar e aprovar processos gerados

- [ ] T094 [P] [US4] Create GeneratedProcessReview component in frontend/src/components/contracts/GeneratedProcessReview.tsx
- [ ] T095 [US4] Display list of generated processes with auto-generated indicator
- [ ] T096 [US4] Display confidence score for each process
- [ ] T097 [US4] Show link to original contract analysis
- [ ] T098 [US4] Implement edit functionality for generated processes
- [ ] T099 [US4] Implement approve action (sends to approval workflow)
- [ ] T100 [US4] Implement reject action with reason
- [ ] T101 [US4] Create process review page in frontend/src/app/(dashboard)/contracts/[id]/processes/page.tsx
- [ ] T102 [US4] Show comparison between original generated version and edited version
- [ ] T103 [US4] Write E2E tests for review flow

## Phase 10: Frontend - Status e Histórico (User Stories 2, 6)

**Purpose**: Interface para acompanhar processamento e histórico

- [ ] T104 [P] [US2] Create ProcessingStatus component in frontend/src/components/contracts/ProcessingStatus.tsx
- [ ] T105 [US2] Display real-time processing status
- [ ] T106 [US2] Show progress percentage during processing
- [ ] T107 [US2] Display estimated time remaining
- [ ] T108 [US2] Add button to cancel processing
- [ ] T109 [US6] Create ContractHistory component in frontend/src/components/contracts/ContractHistory.tsx
- [ ] T110 [US6] Display processing logs (AI model used, tokens, time)
- [ ] T111 [US6] Display generation logs for each process
- [ ] T112 [US6] Show link from process to contract
- [ ] T113 [US6] Add filters and export functionality
- [ ] T114 [US6] Write E2E tests for status and history

## Phase 11: Integração e Validação

**Purpose**: Integrar com sistemas existentes e validar

- [ ] T115 [P] Integrate with ProcessService for process creation
- [ ] T116 [P] Integrate with EntityService for supplier entity creation
- [ ] T117 [P] Integrate with validation system (004) to validate generated processes
- [ ] T118 [P] Ensure generated processes follow template exactly
- [ ] T119 [P] Validate RACI matrix completeness
- [ ] T120 [P] Validate Mermaid diagram syntax
- [ ] T121 [P] Test end-to-end flow: upload → process → generate → review → approve
- [ ] T122 [P] Write comprehensive integration tests

## Phase 12: Performance e Otimização

**Purpose**: Otimizar performance e adicionar melhorias

- [ ] T123 [P] Implement caching for similar contract analyses
- [ ] T124 [P] Optimize LLM prompts for better accuracy
- [ ] T125 [P] Add batch processing for multiple contracts
- [ ] T126 [P] Implement rate limiting for LLM API calls
- [ ] T127 [P] Add metrics and monitoring (processing time, success rate, costs)
- [ ] T128 [P] Optimize database queries with proper indexes
- [ ] T129 [P] Implement pagination for contracts list
- [ ] T130 [P] Add compression for stored contract files

## Phase 13: Testing & Documentation

**Purpose**: Testes completos e documentação

- [ ] T131 [P] Write comprehensive unit tests for all services
- [ ] T132 [P] Write integration tests for all endpoints
- [ ] T133 [P] Write E2E tests for complete user flows
- [ ] T134 [P] Test with various contract formats and sizes
- [ ] T135 [P] Test error scenarios (invalid files, LLM failures, etc.)
- [ ] T136 [P] Update API documentation (OpenAPI/Swagger)
- [ ] T137 [P] Create user guide for contract ingestion
- [ ] T138 [P] Document LLM prompt engineering and tuning
- [ ] T139 [P] Document deployment and configuration

## Phase 14: Melhorias e Refinamento

**Purpose**: Melhorias baseadas em feedback e métricas

- [ ] T140 [P] Implement feedback loop to improve AI accuracy
- [ ] T141 [P] Add A/B testing for different prompts
- [ ] T142 [P] Implement confidence threshold configuration
- [ ] T143 [P] Add manual override for AI mappings
- [ ] T144 [P] Improve error messages and user guidance
- [ ] T145 [P] Add tooltips and help text throughout UI
- [ ] T146 [P] Implement search functionality for contracts
- [ ] T147 [P] Add export functionality for analysis reports
