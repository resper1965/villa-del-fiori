# Tasks: Aplicação de Gestão de Processos Condominiais com Workflow de Aprovação

**Input**: Design documents from `/specs/003-app-gestao-processos-aprovacao/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan (backend/, frontend/, docker-compose.yml)
- [x] T002 [P] Backend via Supabase (Edge Functions + PostgreSQL) - já implementado
- [ ] T003 [P] Initialize frontend Next.js project with TypeScript in frontend/
- [ ] T004 [P] Configure linting and formatting tools (black, ruff, eslint, prettier)
- [ ] T005 [P] Setup Docker and Docker Compose configuration
- [ ] T006 [P] Configure environment variables (.env.example files)
- [ ] T007 [P] Setup Git repository and .gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Setup PostgreSQL database and connection in backend/src/app/core/database.py
- [ ] T009 [P] Create Alembic migrations framework and initial migration structure
- [ ] T010 [P] Implement authentication framework (JWT) in backend/src/app/core/security.py
- [ ] T011 [P] Setup API routing structure in backend/src/app/api/v1/router.py
- [ ] T012 [P] Create base SQLAlchemy models (Base class) in backend/src/app/core/database.py
- [ ] T013 [P] Configure error handling and logging infrastructure
- [ ] T014 [P] Setup environment configuration management (Pydantic Settings)
- [ ] T015 [P] Create base API dependencies (get_current_user, get_db) in backend/src/app/api/deps.py
- [ ] T016 [P] Setup CORS and middleware in backend/src/app/main.py
- [ ] T017 [P] Initialize Next.js App Router structure in frontend/src/app/
- [ ] T018 [P] Setup API client and React Query in frontend/src/lib/api/
- [ ] T019 [P] Configure Tailwind CSS and shadcn/ui in frontend/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Criação e Visualização de Processos (Priority: P1) 🎯 MVP

**Goal**: Stakeholders podem visualizar todos os processos organizados por categorias e ver detalhes completos

**Independent Test**: Criar processos em diferentes categorias, visualizar lista organizada, acessar detalhes de processo específico

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create Stakeholder model in backend/src/app/models/stakeholder.py
- [ ] T021 [P] [US1] Create Process model in backend/src/app/models/process.py
- [ ] T022 [P] [US1] Create ProcessVersion model in backend/src/app/models/version.py
- [ ] T023 [US1] Create database migration for Stakeholder, Process, ProcessVersion models
- [ ] T024 [P] [US1] Create Pydantic schemas for Process in backend/src/app/schemas/process.py
- [ ] T025 [US1] Implement ProcessService in backend/src/app/services/process_service.py (CRUD operations)
- [ ] T026 [US1] Implement GET /api/v1/processes endpoint in backend/src/app/api/v1/endpoints/processes.py (list with filters)
- [ ] T027 [US1] Implement GET /api/v1/processes/{id} endpoint in backend/src/app/api/v1/endpoints/processes.py (details)
- [ ] T028 [US1] Implement POST /api/v1/processes endpoint in backend/src/app/api/v1/endpoints/processes.py (create)
- [ ] T029 [P] [US1] Create ProcessList component in frontend/src/components/processes/ProcessList.tsx
- [ ] T030 [P] [US1] Create ProcessCard component in frontend/src/components/processes/ProcessCard.tsx
- [ ] T031 [P] [US1] Create ProcessDetail component in frontend/src/components/processes/ProcessDetail.tsx
- [ ] T032 [US1] Create processes page in frontend/src/app/(dashboard)/processes/page.tsx
- [ ] T033 [US1] Create process detail page in frontend/src/app/(dashboard)/processes/[id]/page.tsx
- [ ] T034 [US1] Implement API client functions in frontend/src/lib/api/processes.ts
- [ ] T035 [US1] Create useProcesses hook in frontend/src/lib/hooks/useProcesses.ts
- [ ] T036 [US1] Add status indicators and category filtering in UI

**Checkpoint**: At this point, User Story 1 should be fully functional - stakeholders can view and create processes

---

## Phase 4: User Story 2 - Workflow de Aprovação por Stakeholders (Priority: P1) 🎯 MVP

**Goal**: Stakeholders podem aprovar ou rejeitar processos, sistema garante aprovação de todos necessários

**Independent Test**: Criar processo, enviar para aprovação, aprovar como stakeholder, verificar status atualizado

### Implementation for User Story 2

- [ ] T037 [P] [US2] Create Approval model in backend/src/app/models/approval.py
- [ ] T038 [P] [US2] Create Rejection model in backend/src/app/models/rejection.py
- [ ] T039 [P] [US2] Create WorkflowApproval model in backend/src/app/models/workflow_approval.py
- [ ] T040 [US2] Create database migration for Approval, Rejection, WorkflowApproval models
- [ ] T041 [P] [US2] Create Pydantic schemas for Approval/Rejection in backend/src/app/schemas/approval.py
- [ ] T042 [US2] Implement ApprovalService in backend/src/app/services/approval_service.py (workflow logic)
- [ ] T043 [US2] Implement POST /api/v1/processes/{id}/submit endpoint (send to approval)
- [ ] T044 [US2] Implement POST /api/v1/processes/{id}/approve endpoint in backend/src/app/api/v1/endpoints/approvals.py
- [ ] T045 [US2] Implement POST /api/v1/processes/{id}/reject endpoint in backend/src/app/api/v1/endpoints/approvals.py
- [ ] T046 [US2] Implement workflow logic to check if all required approvals received
- [ ] T047 [P] [US2] Create ApprovalActions component in frontend/src/components/approvals/ApprovalActions.tsx
- [ ] T048 [US2] Create approval/rejection UI in process detail page
- [ ] T049 [US2] Implement API client functions in frontend/src/lib/api/approvals.ts
- [ ] T050 [US2] Update process status display based on approval state

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - full approval workflow functional

---

## Phase 5: User Story 3 - Rejeição com Explicação de Motivos (Priority: P1) 🎯 MVP

**Goal**: Quando stakeholder rejeita, deve explicar motivo de forma estruturada

**Independent Test**: Rejeitar processo com motivo, verificar motivo salvo e exibido para criador

### Implementation for User Story 3

- [ ] T051 [US3] Add reason field validation (required) in Rejection model
- [ ] T052 [US3] Update RejectionRequest schema to require reason field
- [ ] T053 [US3] Update reject endpoint to validate reason is provided
- [ ] T054 [P] [US3] Create RejectionForm component in frontend/src/components/approvals/RejectionForm.tsx
- [ ] T055 [US3] Implement reason input field with validation in rejection UI
- [ ] T056 [US3] Display rejection reasons prominently in process detail view
- [ ] T057 [US3] Organize multiple rejection reasons by stakeholder and date
- [ ] T058 [US3] Add rejection reason display in process history

**Checkpoint**: Rejection with reasons fully functional

---

## Phase 6: User Story 4 - Refazer Processo Baseado em Feedback (Priority: P1) 🎯 MVP

**Goal**: Criador pode refazer processo baseado em motivos de rejeição, criar nova versão, reenviar

**Independent Test**: Rejeitar processo com motivo, refazer processo, criar nova versão, reenviar para aprovação

### Implementation for User Story 4

- [ ] T059 [US4] Implement versioning logic in VersionService in backend/src/app/services/version_service.py
- [ ] T060 [US4] Implement POST /api/v1/processes/{id}/refactor endpoint
- [ ] T061 [US4] Create new ProcessVersion when refactoring (increment version number)
- [ ] T062 [US4] Link new version to previous version (previous_version_id)
- [ ] T063 [US4] Allow creator to add change_summary when refactoring
- [ ] T064 [P] [US4] Create ProcessEditor component in frontend/src/components/processes/ProcessEditor.tsx
- [ ] T065 [US4] Create refactor page in frontend/src/app/(dashboard)/processes/[id]/refazer/page.tsx
- [ ] T066 [US4] Display rejection reasons during refactor process for reference
- [ ] T067 [US4] Implement version comparison logic in backend
- [ ] T068 [US4] Implement GET /api/v1/processes/{id}/versions/{version_id}/compare endpoint
- [ ] T069 [P] [US4] Create VersionComparison component in frontend/src/components/processes/VersionComparison.tsx
- [ ] T070 [US4] Allow creator to mark which rejection reasons were addressed
- [ ] T071 [US4] Implement re-submit for approval after refactoring

**Checkpoint**: Full refactor workflow functional - processes can be rejected, refactored, and resubmitted

---

## Phase 7: User Story 5 - Gestão de Stakeholders e Permissões (Priority: P2)

**Goal**: Sistema gerencia quais stakeholders podem aprovar cada tipo de processo, define permissões

**Independent Test**: Criar stakeholders, atribuir permissões, verificar aprovações restritas corretamente

### Implementation for User Story 5

- [ ] T072 [US5] Implement role-based permissions check in backend/src/app/core/security.py
- [ ] T073 [US5] Create WorkflowStakeholder association table for many-to-many relationship
- [ ] T074 [US5] Implement automatic stakeholder assignment based on process category
- [ ] T075 [US5] Implement GET /api/v1/stakeholders endpoint
- [ ] T076 [US5] Implement POST /api/v1/stakeholders endpoint
- [ ] T077 [US5] Implement PUT /api/v1/stakeholders/{id} endpoint (update permissions)
- [ ] T078 [US5] Add permission checks in approval/rejection endpoints
- [ ] T079 [P] [US5] Create StakeholderList component in frontend
- [ ] T080 [P] [US5] Create StakeholderForm component in frontend
- [ ] T081 [US5] Create stakeholders management page in frontend
- [ ] T082 [US5] Display permission errors when unauthorized user tries to approve

**Checkpoint**: Stakeholder management and permissions functional

---

## Phase 8: User Story 6 - Histórico e Rastreabilidade (Priority: P2)

**Goal**: Sistema mantém histórico completo de aprovações, rejeições, versões e alterações

**Independent Test**: Aprovar, rejeitar, refazer processo múltiplas vezes, verificar histórico completo

### Implementation for User Story 6

- [ ] T083 [P] [US6] Create History model in backend/src/app/models/history.py
- [ ] T084 [US6] Create database migration for History model
- [ ] T085 [US6] Implement history logging service in backend/src/app/services/history_service.py
- [ ] T086 [US6] Log all process events (create, edit, approve, reject, refactor) to history
- [ ] T087 [US6] Implement GET /api/v1/processes/{id}/history endpoint
- [ ] T088 [US6] Implement GET /api/v1/processes/{id}/versions endpoint (list all versions)
- [ ] T089 [P] [US6] Create HistoryTimeline component in frontend
- [ ] T090 [US6] Display history timeline in process detail page
- [ ] T091 [US6] Allow navigation between versions in UI
- [ ] T092 [US6] Implement version diff display

**Checkpoint**: Complete history and traceability functional

---

## Phase 9: User Story 7 - Notificações e Alertas (Priority: P2)

**Goal**: Sistema notifica stakeholders sobre processos pendentes, rejeições, aprovações

**Independent Test**: Criar processo, verificar notificações enviadas, aprovar/rejeitar, verificar notificações

### Implementation for User Story 7

- [ ] T093 [P] [US7] Create Notification model in backend/src/app/models/notification.py
- [ ] T094 [US7] Create database migration for Notification model
- [ ] T095 [US7] Implement NotificationService in backend/src/app/services/notification_service.py
- [ ] T096 [US7] Implement email sending functionality (aiosmtplib or SendGrid)
- [ ] T097 [US7] Send notifications when process submitted for approval
- [ ] T098 [US7] Send notifications when process approved/rejected
- [ ] T099 [US7] Send notifications when process refactored and resubmitted
- [ ] T100 [US7] Implement reminder notifications for pending approvals
- [ ] T101 [US7] Implement GET /api/v1/notifications endpoint
- [ ] T102 [US7] Implement POST /api/v1/notifications/{id}/read endpoint
- [ ] T103 [P] [US7] Create Notifications component in frontend/src/components/layout/Notifications.tsx
- [ ] T104 [US7] Display notification badge in header
- [ ] T105 [US7] Create notifications page in frontend

**Checkpoint**: Notification system functional

---

## Phase 10: User Story 8 - Dashboard e Visão Geral (Priority: P3)

**Goal**: Dashboard mostra processos pendentes, rejeitados, aprovados recentemente e estatísticas

**Independent Test**: Criar múltiplos processos em diferentes status, verificar dashboard exibe corretamente

### Implementation for User Story 8

- [ ] T106 [US8] Implement GET /api/v1/dashboard endpoint
- [ ] T107 [US8] Calculate statistics (total, approved, rejected, in_review) in backend
- [ ] T108 [US8] Get pending approvals for current user
- [ ] T109 [US8] Get recent activity
- [ ] T110 [P] [US8] Create DashboardStats component in frontend/src/components/dashboard/DashboardStats.tsx
- [ ] T111 [P] [US8] Create PendingApprovals component in frontend/src/components/dashboard/PendingApprovals.tsx
- [ ] T112 [P] [US8] Create RecentActivity component in frontend/src/components/dashboard/RecentActivity.tsx
- [ ] T113 [US8] Create dashboard page in frontend/src/app/(dashboard)/dashboard/page.tsx
- [ ] T114 [US8] Implement filters in dashboard (status, category, stakeholder)
- [ ] T115 [US8] Highlight processes with approaching deadlines

**Checkpoint**: Dashboard functional with statistics and filters

---

## Phase 11: Processos Pré-Cadastrados

**Purpose**: Incluir todos os processos descritos nas especificações anteriores

- [ ] T116 Create seed service in backend/src/app/services/seed_service.py
- [ ] T117 [P] Create seed data for Governança processes
- [ ] T118 [P] Create seed data for Acesso e Segurança processes
- [ ] T119 [P] Create seed data for Operação processes
- [ ] T120 [P] Create seed data for Áreas Comuns processes
- [ ] T121 [P] Create seed data for Convivência processes
- [ ] T122 [P] Create seed data for Eventos processes
- [ ] T123 [P] Create seed data for Emergências processes
- [ ] T124 Run seed script to populate database with pre-cadastred processes

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T125 [P] Add comprehensive error handling across all endpoints
- [ ] T126 [P] Add input validation and sanitization
- [ ] T127 [P] Add logging for all critical operations
- [ ] T128 [P] Implement pagination for all list endpoints
- [ ] T129 [P] Add database indexes for performance (see data-model.md)
- [ ] T130 [P] Implement full-text search for processes
- [ ] T131 [P] Add API rate limiting
- [ ] T132 [P] Add comprehensive API documentation (OpenAPI/Swagger)
- [ ] T133 [P] Create comprehensive README.md
- [ ] T134 [P] Add unit tests for critical services
- [ ] T135 [P] Add integration tests for API endpoints
- [ ] T136 [P] Add E2E tests for critical user flows
- [ ] T137 [P] Security audit and hardening
- [ ] T138 [P] Performance optimization
- [ ] T139 [P] Accessibility improvements (a11y)
- [ ] T140 [P] Responsive design improvements
- [ ] T141 Run quickstart.md validation
- [ ] T142 Documentation updates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
  - US1, US2, US3, US4 are P1 and form the MVP
  - US5, US6, US7 are P2 and add important features
  - US8 is P3 and adds polish
- **Processos Pré-Cadastrados (Phase 11)**: Can be done in parallel with user stories
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies
- **User Story 2 (P1)**: Depends on US1 (needs Process model)
- **User Story 3 (P1)**: Depends on US2 (needs Rejection model)
- **User Story 4 (P1)**: Depends on US1, US2, US3 (needs Process, Version, Rejection)
- **User Story 5 (P2)**: Depends on US2 (needs approval workflow)
- **User Story 6 (P2)**: Depends on US1, US2, US4 (needs Process, Approval, Version)
- **User Story 7 (P2)**: Depends on US2 (needs approval workflow)
- **User Story 8 (P3)**: Depends on US1, US2, US6 (needs Process, Approval, History)

### Within Each User Story

- Models before services
- Services before endpoints
- Backend before frontend (for each feature)
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Frontend components marked [P] can run in parallel
- Seed data creation (Phase 11) can run in parallel with user stories
- Polish tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Visualization)
4. Complete Phase 4: User Story 2 (Approval Workflow)
5. Complete Phase 5: User Story 3 (Rejection with Reasons)
6. Complete Phase 6: User Story 4 (Refactor Process)
7. **STOP and VALIDATE**: Test MVP independently
8. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy/Demo
3. Add US2 → Test independently → Deploy/Demo
4. Add US3 → Test independently → Deploy/Demo
5. Add US4 → Test independently → Deploy/Demo (MVP Complete!)
6. Add US5, US6, US7 (P2) → Test → Deploy
7. Add US8 (P3) → Test → Deploy
8. Add Pre-cadastred Processes → Deploy
9. Polish → Final Release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend and frontend can be developed in parallel once API contracts are defined
- Focus on MVP (US1-US4) first, then add P2 and P3 features


