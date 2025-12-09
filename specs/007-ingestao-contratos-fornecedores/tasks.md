# Tasks: Ingestão e Processamento de Contratos de Fornecedores

**Input**: Design documents from `/specs/007-ingestao-contratos-fornecedores/`
**Prerequisites**: plan.md ✓, spec.md ✓

**Organization**: Tasks are grouped by user story and implementation phase to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Fundação e Extração de Texto (Semana 1-2)

**Purpose**: Setup básico e extração de texto de documentos

### Backend - Models & Database

- [ ] T001 [US1] Create Contract model in backend/src/app/models/contract.py
- [ ] T002 [US2] Create ContractAnalysis model in backend/src/app/models/contract_analysis.py
- [ ] T003 [US1] Create ContractHistory model in backend/src/app/models/contract.py
- [ ] T004 [P] [US1] Create ContractStatus enum and ContractHistoryEvent enum
- [ ] T005 [US1] Create Alembic migration 007_add_contracts_table.py
- [ ] T006 [US1] Add source_contract_id and related fields to Process model
- [ ] T007 [US1] Run and test migrations

### Backend - File Storage

- [ ] T008 [P] [US1] Implement FileStorageService in backend/src/app/services/file_storage_service.py
- [ ] T009 [US1] Configure local storage backend
- [ ] T010 [P] [US1] Configure S3 storage backend (opcional)
- [ ] T011 [US1] Add file upload validation (size, type, security)

### Backend - Extraction Service

- [ ] T012 [US1] Create ExtractionService in backend/src/app/services/extraction_service.py
- [ ] T013 [US1] Implement _extract_from_pdf() method using pdfplumber
- [ ] T014 [US1] Implement _extract_from_docx() method using python-docx
- [ ] T015 [P] [US1] Implement _extract_from_image_ocr() method using Tesseract
- [ ] T016 [P] [US1] Implement _extract_from_pdf_ocr() method for scanned PDFs
- [ ] T017 [US1] Add confidence scoring for extraction methods
- [ ] T018 [US1] Write unit tests for ExtractionService

### Backend - API Endpoints

- [ ] T019 [US1] Create ContractService in backend/src/app/services/contract_service.py
- [ ] T020 [US1] Create Pydantic schemas in backend/src/app/schemas/contract.py
- [ ] T021 [US1] Implement POST /api/v1/contracts/upload endpoint
- [ ] T022 [P] [US1] Implement GET /api/v1/contracts endpoint (list)
- [ ] T023 [P] [US1] Implement GET /api/v1/contracts/{id} endpoint (details)
- [ ] T024 [P] [US1] Implement GET /api/v1/contracts/{id}/download endpoint
- [ ] T025 [P] [US1] Implement DELETE /api/v1/contracts/{id} endpoint
- [ ] T026 [US1] Add authentication and authorization to contract endpoints
- [ ] T027 [US1] Write integration tests for contract endpoints

### Backend - Async Tasks

- [ ] T028 [US1] Configure Celery in backend/src/app/core/celery.py
- [ ] T029 [US1] Configure Redis connection
- [ ] T030 [US1] Create contract_tasks.py in backend/src/app/tasks/
- [ ] T031 [US1] Implement extract_contract_text_task()
- [ ] T032 [US1] Add retry logic and error handling
- [ ] T033 [US1] Implement contract history logging helper
- [ ] T034 [US1] Write tests for async tasks

### Frontend - Upload & List

- [ ] T035 [P] [US1] Create contracts page in frontend/src/app/(dashboard)/contracts/page.tsx
- [ ] T036 [US1] Create ContractUpload component in frontend/src/components/contracts/ContractUpload.tsx
- [ ] T037 [US1] Create ContractList component in frontend/src/components/contracts/ContractList.tsx
- [ ] T038 [US1] Create StatusBadge component for contract status
- [ ] T039 [US1] Create API client functions in frontend/src/lib/api/contracts.ts
- [ ] T040 [US1] Add file upload with progress indicator
- [ ] T041 [US1] Add error handling and user feedback
- [ ] T042 [US1] Write E2E tests for upload flow

---

## Phase 2: IA e Análise (Semana 3-4)

**Purpose**: Análise inteligente de contratos usando LLM

### Backend - LLM Client

- [ ] T043 [US2] Create LLMClient utility in backend/src/app/utils/llm_client.py
- [ ] T044 [US2] Configure Anthropic Claude API
- [ ] T045 [P] [US2] Configure OpenAI API (fallback)
- [ ] T046 [US2] Implement generate() method with retry logic
- [ ] T047 [US2] Add token usage tracking
- [ ] T048 [US2] Implement rate limiting for LLM calls
- [ ] T049 [US2] Write unit tests for LLMClient

### Backend - AI Analysis Service

- [ ] T050 [US2] Create AIAnalysisService in backend/src/app/services/ai_analysis_service.py
- [ ] T051 [US2] Create ANALYSIS_PROMPT template
- [ ] T052 [US2] Implement analyze_contract() method
- [ ] T053 [US2] Implement _calculate_confidence() method
- [ ] T054 [US2] Add JSON response validation
- [ ] T055 [US2] Add error handling for LLM failures
- [ ] T056 [US2] Write unit tests with mock LLM responses

### Backend - Analysis Task

- [ ] T057 [US2] Implement analyze_contract_task() in backend/src/app/tasks/contract_tasks.py
- [ ] T058 [US2] Connect extraction task → analysis task pipeline
- [ ] T059 [US2] Add analysis result validation
- [ ] T060 [US2] Store ContractAnalysis in database
- [ ] T061 [US2] Write integration tests for analysis pipeline

### Backend - Analysis API

- [ ] T062 [P] [US2] Implement GET /api/v1/contracts/{id}/analysis endpoint
- [ ] T063 [P] [US2] Create ContractAnalysisResponse schema
- [ ] T064 [US2] Add caching for analysis results
- [ ] T065 [US2] Write integration tests

### Frontend - Analysis Display

- [ ] T066 [P] [US2] Create contract detail page in frontend/src/app/(dashboard)/contracts/[id]/page.tsx
- [ ] T067 [US2] Create ContractDetails component
- [ ] T068 [US2] Create AnalysisResults component in frontend/src/components/contracts/AnalysisResults.tsx
- [ ] T069 [US2] Display services identified
- [ ] T070 [US2] Display scope of work
- [ ] T071 [US2] Display inferred processes
- [ ] T072 [US2] Display confidence score
- [ ] T073 [US2] Add loading states and error handling
- [ ] T074 [US2] Write E2E tests for analysis display

---

## Phase 3: Geração de Processos (Semana 5-6)

**Purpose**: Geração automática de processos estruturados

### Backend - Process Generation Service

- [ ] T075 [US3] Create ProcessGenerationService in backend/src/app/services/process_generation_service.py
- [ ] T076 [US3] Create WORKFLOW_GENERATION_PROMPT template
- [ ] T077 [US3] Implement generate_workflow() method
- [ ] T078 [US4] Create RACI_GENERATION_PROMPT template
- [ ] T079 [US4] Implement generate_raci() method
- [ ] T080 [US4] Implement _validate_raci() method
- [ ] T081 [US5] Create MERMAID_GENERATION_PROMPT template
- [ ] T082 [US5] Implement generate_mermaid_diagram() method
- [ ] T083 [US5] Implement _validate_mermaid_syntax() method
- [ ] T084 [US5] Implement _generate_simple_mermaid() fallback
- [ ] T085 [US3] Implement identify_entities() method
- [ ] T086 [US7] Implement identify_variables() method
- [ ] T087 [US3] Implement get_icon_for_category() method
- [ ] T088 [US3] Write comprehensive unit tests

### Backend - Entity Matching Service

- [ ] T089 [US6] Create EntityMatchingService in backend/src/app/services/entity_matching_service.py
- [ ] T090 [US6] Implement validate_entities() method
- [ ] T091 [US6] Implement _find_similar_entity() with fuzzy matching
- [ ] T092 [US6] Implement _infer_entity_type() method
- [ ] T093 [P] [US6] Create EntitySuggestion model (opcional)
- [ ] T094 [US6] Write unit tests for entity matching

### Backend - Process Generation Task

- [ ] T095 [US3] Implement generate_processes_task() in backend/src/app/tasks/contract_tasks.py
- [ ] T096 [US3] Integrate workflow generation
- [ ] T097 [US4] Integrate RACI generation
- [ ] T098 [US5] Integrate Mermaid diagram generation
- [ ] T099 [US6] Integrate entity validation
- [ ] T100 [US7] Integrate variable identification
- [ ] T101 [US9] Handle multiple processes per contract
- [ ] T102 [US3] Create Process records in database
- [ ] T103 [US3] Update contract status to "review"
- [ ] T104 [US3] Add error handling for individual process failures
- [ ] T105 [US3] Write integration tests

### Backend - Process API

- [ ] T106 [P] [US3] Implement GET /api/v1/contracts/{id}/processes endpoint
- [ ] T107 [US8] Extend PUT /api/v1/processes/{id} for process editing
- [ ] T108 [P] [US8] Implement POST /api/v1/processes/{id}/submit-for-approval endpoint
- [ ] T109 [US3] Add process generation metadata to response
- [ ] T110 [US3] Write integration tests

---

## Phase 4: Revisão e Edição (Semana 7-8)

**Purpose**: Interface de revisão e edição de processos gerados

### Frontend - Process Preview

- [ ] T111 [US8] Create processes list in contract details page
- [ ] T112 [P] [US8] Create ProcessPreview component in frontend/src/components/contracts/ProcessPreview.tsx
- [ ] T113 [US8] Display workflow steps
- [ ] T114 [US8] Display RACI matrix
- [ ] T115 [US8] Display Mermaid diagram with rendering
- [ ] T116 [US8] Display entities and variables
- [ ] T117 [US8] Display generation confidence
- [ ] T118 [US8] Add expand/collapse functionality

### Frontend - Process Editor

- [ ] T119 [P] [US8] Create process edit page in frontend/src/app/(dashboard)/contracts/[id]/processes/[processId]/page.tsx
- [ ] T120 [US8] Create ProcessEditor component in frontend/src/components/contracts/ProcessEditor.tsx
- [ ] T121 [US8] Implement workflow editor (add/remove/reorder steps)
- [ ] T122 [US8] Implement RACI matrix editor
- [ ] T123 [US8] Implement entity selector/editor
- [ ] T124 [US8] Implement variable selector/editor
- [ ] T125 [US8] Implement Mermaid diagram editor (code + preview)
- [ ] T126 [US8] Add real-time validation
- [ ] T127 [US8] Add save draft functionality
- [ ] T128 [US8] Add submit for approval functionality
- [ ] T129 [US8] Mark process as edited when changes are made
- [ ] T130 [US8] Write E2E tests for editing flow

### Backend - Validation

- [ ] T131 [US8] Implement validate_process_consistency() in ProcessService
- [ ] T132 [US8] Validate workflow vs RACI alignment
- [ ] T133 [US8] Validate entity existence (integrate with feature 004)
- [ ] T134 [US8] Validate Mermaid syntax
- [ ] T135 [US8] Return detailed validation errors
- [ ] T136 [US8] Write unit tests for validation

---

## Phase 5: Dashboard e Gestão (Semana 9-10)

**Purpose**: Dashboard de gestão e métricas

### Backend - History & Metrics

- [ ] T137 [P] [US10] Implement GET /api/v1/contracts/{id}/history endpoint
- [ ] T138 [P] [US10] Create ContractHistoryResponse schema
- [ ] T139 [US10] Implement GET /api/v1/contracts/metrics endpoint
- [ ] T140 [US10] Calculate processing metrics (avg time, success rate)
- [ ] T141 [P] [US10] Implement POST /api/v1/contracts/{id}/reprocess endpoint
- [ ] T142 [US10] Write integration tests

### Frontend - Contract Dashboard

- [ ] T143 [P] [US10] Create ContractDashboard component
- [ ] T144 [US10] Add filters (supplier, service type, status, date)
- [ ] T145 [US10] Add search functionality
- [ ] T146 [US10] Add sorting options
- [ ] T147 [US10] Display processing status with visual indicators
- [ ] T148 [US10] Add reprocess action
- [ ] T149 [US10] Write E2E tests

### Frontend - Metrics Dashboard

- [ ] T150 [P] [US10] Create MetricsDashboard component
- [ ] T151 [US10] Display total contracts processed
- [ ] T152 [US10] Display total processes generated
- [ ] T153 [US10] Display average processing time
- [ ] T154 [US10] Display success/error rates
- [ ] T155 [US10] Add charts/graphs (opcional)
- [ ] T156 [US10] Write tests

### Frontend - History Timeline

- [ ] T157 [P] [US10] Create ContractTimeline component
- [ ] T158 [US10] Display processing events chronologically
- [ ] T159 [US10] Display event details and errors
- [ ] T160 [US10] Add expand/collapse for event details
- [ ] T161 [US10] Write tests

### Backend - Notifications

- [ ] T162 [P] [US10] Create NotificationService in backend/src/app/services/notification_service.py
- [ ] T163 [US10] Implement notify_contract_processed()
- [ ] T164 [US10] Implement notify_processing_error()
- [ ] T165 [US10] Integrate with existing notification system
- [ ] T166 [US10] Write unit tests

---

## Phase 6: OCR e Refinamentos (Semana 11-12)

**Purpose**: OCR para documentos escaneados e melhorias finais

### Backend - OCR Implementation

- [ ] T167 [P] [US1] Install and configure Tesseract OCR
- [ ] T168 [US1] Implement OCR extraction in ExtractionService
- [ ] T169 [US1] Add image preprocessing for better OCR quality
- [ ] T170 [P] [US1] Configure Google Vision API (opcional)
- [ ] T171 [P] [US1] Configure AWS Textract (opcional)
- [ ] T172 [US1] Add OCR quality assessment
- [ ] T173 [US1] Write tests for OCR functionality

### Backend - Multiple Processes per Contract

- [ ] T174 [US9] Enhance analysis to identify multiple services
- [ ] T175 [US9] Generate separate processes for each service
- [ ] T176 [US9] Link processes to source contract
- [ ] T177 [US9] Add merge/split functionality
- [ ] T178 [US9] Write tests

### Backend - Entity Suggestions

- [ ] T179 [P] [US6] Create SuggestedEntity model
- [ ] T180 [US6] Store entity suggestions during generation
- [ ] T181 [US6] Create endpoint to list entity suggestions
- [ ] T182 [US6] Create endpoint to approve/reject suggestions
- [ ] T183 [US6] Auto-create entity when approved
- [ ] T184 [US6] Write tests

### Frontend - Entity Suggestions UI

- [ ] T185 [P] [US6] Create EntitySuggestions component
- [ ] T186 [US6] Display suggested entities in process editor
- [ ] T187 [US6] Add approve/reject actions
- [ ] T188 [US6] Add create entity quick action
- [ ] T189 [US6] Refresh process after entity creation
- [ ] T190 [US6] Write E2E tests

### Performance Optimization

- [ ] T191 [P] Add database indexes for contract queries
- [ ] T192 [P] Implement caching for frequent queries
- [ ] T193 [P] Optimize LLM token usage
- [ ] T194 [P] Add pagination to contract list
- [ ] T195 [P] Implement lazy loading for process details
- [ ] T196 [P] Add request rate limiting
- [ ] T197 [P] Profile and optimize slow queries

### Monitoring & Logging

- [ ] T198 [P] Add structured logging for all services
- [ ] T199 [P] Add metrics collection (Prometheus/StatsD)
- [ ] T200 [P] Add error tracking (Sentry/Rollbar)
- [ ] T201 [P] Add LLM usage tracking and alerts
- [ ] T202 [P] Add processing time monitoring
- [ ] T203 [P] Create health check endpoint

---

## Phase 7: Testing & Documentation (Semana 11-12)

**Purpose**: Testes completos e documentação

### Backend Tests

- [ ] T204 [P] Write unit tests for all services (target 80%+ coverage)
- [ ] T205 [P] Write integration tests for all endpoints
- [ ] T206 [P] Write tests for async tasks with mocked LLM
- [ ] T207 [P] Write tests for error scenarios
- [ ] T208 [P] Write performance tests (load testing)

### Frontend Tests

- [ ] T209 [P] Write unit tests for components
- [ ] T210 [P] Write integration tests with mocked API
- [ ] T211 [P] Write E2E tests for complete flow (upload → review → approve)
- [ ] T212 [P] Write E2E tests for error scenarios
- [ ] T213 [P] Add visual regression tests (opcional)

### E2E Flow Tests

- [ ] T214 [P] Test complete flow: PDF upload → extraction → analysis → generation → edit → approval
- [ ] T215 [P] Test complete flow: DOCX upload → extraction → analysis → generation
- [ ] T216 [P] Test complete flow: Scanned PDF → OCR → analysis → generation
- [ ] T217 [P] Test error handling: invalid file, extraction failure, LLM failure
- [ ] T218 [P] Test multiple processes generation from single contract
- [ ] T219 [P] Test entity validation and suggestions
- [ ] T220 [P] Test reprocessing of contracts

### Documentation

- [ ] T221 [P] Update main README with contract ingestion feature
- [ ] T222 [P] Create API documentation (OpenAPI/Swagger)
- [ ] T223 [P] Create user guide for contract upload
- [ ] T224 [P] Create admin guide for reviewing generated processes
- [ ] T225 [P] Document LLM configuration and costs
- [ ] T226 [P] Document OCR setup and configuration
- [ ] T227 [P] Create troubleshooting guide
- [ ] T228 [P] Document prompt engineering decisions
- [ ] T229 [P] Create architecture diagram
- [ ] T230 [P] Add code comments and docstrings

### Deployment & Configuration

- [ ] T231 [P] Create environment variables documentation
- [ ] T232 [P] Create deployment checklist
- [ ] T233 [P] Update docker-compose.yml with Redis and Celery
- [ ] T234 [P] Create Docker configuration for Celery workers
- [ ] T235 [P] Add production configuration examples
- [ ] T236 [P] Create backup/restore procedures
- [ ] T237 [P] Test deployment on staging environment
- [ ] T238 [P] Create rollback plan

---

## Summary by User Story

**US1 - Upload e Ingestão**: T001-T042 (42 tasks)  
**US2 - Análise por IA**: T043-T074 (32 tasks)  
**US3 - Geração de Workflow**: T075-T110 (36 tasks)  
**US4 - Geração de RACI**: T079-T080 (included in US3)  
**US5 - Geração de Mermaid**: T081-T084 (included in US3)  
**US6 - Validação de Entidades**: T089-T094, T179-T190 (18 tasks)  
**US7 - Identificação de Variáveis**: T086-T087 (included in US3)  
**US8 - Revisão e Edição**: T111-T136 (26 tasks)  
**US9 - Múltiplos Processos**: T101, T174-T178 (6 tasks)  
**US10 - Dashboard e Gestão**: T137-T166 (30 tasks)  

**Total**: ~238 tasks

---

## Estimativas de Tempo

- **Phase 1**: 2 semanas (Backend + Frontend fundação)
- **Phase 2**: 2 semanas (IA e análise)
- **Phase 3**: 2 semanas (Geração de processos)
- **Phase 4**: 2 semanas (Revisão e edição)
- **Phase 5**: 2 semanas (Dashboard)
- **Phase 6**: 2 semanas (OCR e refinamentos)
- **Phase 7**: Contínuo (Testes e documentação paralelos)

**Total**: ~10-12 semanas para implementação completa

---

## Prioridades

**P1 (Crítico)**: T001-T110 (Fundação, Análise, Geração)  
**P2 (Importante)**: T111-T166 (Revisão, Dashboard)  
**P3 (Desejável)**: T167-T238 (OCR, Refinamentos, Otimizações)

---

## Notas

- Tasks marcadas com [P] podem ser executadas em paralelo por diferentes desenvolvedores
- Tasks de testes devem ser escritas junto com a implementação, não deixar para o final
- Revisões de código devem acontecer a cada fase
- Demo para stakeholders deve acontecer ao final de cada fase
