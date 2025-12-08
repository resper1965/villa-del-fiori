# Tasks: Validação de Entidades em Processos

**Input**: Design documents from `/specs/004-validacao-entidades-processos/`
**Prerequisites**: plan.md ✓, spec.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Backend - Validação Básica (User Story 1)

**Purpose**: Implementar validação de entidades ao criar/editar processos

- [ ] T001 [US1] Create ValidationResult model in backend/src/app/models/validation.py
- [ ] T002 [US1] Create EntityValidationService in backend/src/app/services/entity_validation_service.py
- [ ] T003 [US1] Implement validate_entities() method - verifica existência
- [ ] T004 [US1] Implement validate_entity_completeness() method - verifica campos obrigatórios
- [ ] T005 [US1] Create Pydantic schemas for validation in backend/src/app/schemas/validation.py
- [ ] T006 [US1] Create POST /api/v1/processes/validate endpoint in backend/src/app/api/v1/endpoints/validation.py
- [ ] T007 [US1] Integrate validation in ProcessService.create() and ProcessService.update()
- [ ] T008 [US1] Add validation cache service in backend/src/app/services/validation_cache_service.py
- [ ] T009 [US1] Create database migration for validation_cache table (opcional)
- [ ] T010 [US1] Write unit tests for EntityValidationService
- [ ] T011 [US1] Write integration tests for validation endpoint

## Phase 2: Frontend - Validação em Tempo Real (User Story 1)

**Purpose**: Interface de validação em tempo real no formulário de processo

- [ ] T012 [P] [US1] Create EntityValidation component in frontend/src/components/validation/EntityValidation.tsx
- [ ] T013 [US1] Integrate validation in ProcessForm component
- [ ] T014 [US1] Create validation error messages component
- [ ] T015 [US1] Implement real-time validation on entity input change
- [ ] T016 [US1] Create API client function for validation in frontend/src/lib/api/validation.ts
- [ ] T017 [US1] Create useValidation hook in frontend/src/lib/hooks/useValidation.ts
- [ ] T018 [US1] Add visual indicators for valid/invalid entities
- [ ] T019 [US1] Block form submission if validation fails
- [ ] T020 [US1] Write E2E tests for validation flow

## Phase 3: Criação Rápida de Entidades (User Story 3)

**Purpose**: Permitir criar entidades rapidamente do contexto do processo

- [ ] T021 [US3] Create QuickEntityCreate modal component in frontend/src/components/entities/QuickEntityCreate.tsx
- [ ] T022 [US3] Integrate modal in ProcessForm when entity is missing
- [ ] T023 [US3] Pre-fill entity name from process context
- [ ] T024 [US3] Auto-add created entity to process after creation
- [ ] T025 [US3] Refresh validation after entity creation
- [ ] T026 [US3] Write tests for quick entity creation flow

## Phase 4: Validação em Lote (User Story 2)

**Purpose**: Validar todos os processos existentes de uma vez

- [ ] T027 [US2] Create ProcessValidationService in backend/src/app/services/process_validation_service.py
- [ ] T028 [US2] Implement validate_all_processes() method
- [ ] T029 [US2] Create ValidationReport model in backend/src/app/models/validation.py
- [ ] T030 [US2] Create POST /api/v1/processes/validate-batch endpoint
- [ ] T031 [US2] Implement background job for batch validation (Celery ou FastAPI BackgroundTasks)
- [ ] T032 [P] [US2] Create ValidationReport component in frontend/src/components/validation/ValidationReport.tsx
- [ ] T033 [US2] Create validation batch page in frontend/src/app/(dashboard)/validation/page.tsx
- [ ] T034 [US2] Implement report export (CSV/JSON)
- [ ] T035 [US2] Add filters to validation report (by type, by process, etc.)
- [ ] T036 [US2] Write tests for batch validation

## Phase 5: Dashboard de Integridade (User Story 4)

**Purpose**: Dashboard mostrando status de integridade de entidades e processos

- [ ] T037 [US4] Create IntegrityMetrics model in backend/src/app/models/validation.py
- [ ] T038 [US4] Implement calculate_integrity_metrics() in ProcessValidationService
- [ ] T039 [US4] Create GET /api/v1/validation/dashboard endpoint
- [ ] T040 [US4] Implement orphaned entities detection
- [ ] T041 [P] [US4] Create IntegrityDashboard component in frontend/src/components/validation/IntegrityDashboard.tsx
- [ ] T042 [US4] Create dashboard page in frontend/src/app/(dashboard)/validation/dashboard/page.tsx
- [ ] T043 [US4] Add metrics cards (total entities, complete, incomplete, etc.)
- [ ] T044 [US4] Add list of processes with issues
- [ ] T045 [US4] Add list of orphaned entities
- [ ] T046 [US4] Implement quick fix actions from dashboard
- [ ] T047 [US4] Write tests for dashboard

## Phase 6: Performance & Optimization

**Purpose**: Otimizar performance e adicionar cache

- [ ] T048 [P] Implement Redis cache for validations (opcional)
- [ ] T049 [P] Add database indexes for entity lookups
- [ ] T050 [P] Optimize batch validation queries
- [ ] T051 [P] Add pagination to validation reports
- [ ] T052 [P] Implement incremental validation (only changed processes)

## Phase 7: Testing & Documentation

**Purpose**: Testes completos e documentação

- [ ] T053 [P] Write comprehensive unit tests
- [ ] T054 [P] Write integration tests
- [ ] T055 [P] Write E2E tests
- [ ] T056 [P] Update API documentation
- [ ] T057 [P] Create user guide for validation features

