# Implementation Plan: Aplicação de Gestão de Processos Condominiais com Workflow de Aprovação

**Branch**: `003-app-gestao-processos-aprovacao` | **Date**: 2024-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-app-gestao-processos-aprovacao/spec.md`

## Summary

Aplicação web completa para gestão de processos condominiais com workflow de aprovação por stakeholders. Sistema permite que síndico, conselho e administradora revisem, aprovem ou rejeitem processos, com capacidade de refazer processos baseado em feedback estruturado. Inclui todos os processos pré-cadastrados organizados por categorias (Governança, Acesso e Segurança, Operação, Áreas Comuns, Convivência, Eventos, Emergências).

**Abordagem Técnica**: Aplicação web full-stack com backend API REST (Python/FastAPI) e frontend React/Next.js, banco de dados PostgreSQL para persistência, sistema de notificações por email, autenticação JWT e interface responsiva.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.0+ (frontend), Node.js 20+  
**Primary Dependencies**: 
- Backend: FastAPI, SQLAlchemy, Pydantic, Alembic, python-jose (JWT), python-multipart, email-validator
- Frontend: Next.js 14+, React 18+, TypeScript, Tailwind CSS, shadcn/ui, React Query, Zod
- Database: PostgreSQL 15+
- Infrastructure: Docker, Docker Compose

**Storage**: PostgreSQL 15+ para dados relacionais (processos, versões, aprovações, stakeholders, histórico)  
**Testing**: 
- Backend: pytest, pytest-asyncio, httpx (test client), factory-boy
- Frontend: Jest, React Testing Library, Playwright (E2E)
- Integration: pytest com testes de API end-to-end

**Target Platform**: Web (navegadores modernos: Chrome, Firefox, Safari, Edge - últimas 2 versões)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- API response time < 200ms (p95) para operações CRUD
- Time to Interactive (TTI) < 3s no frontend
- Suporte a 50+ stakeholders simultâneos
- Dashboard carrega em < 1s

**Constraints**: 
- Aplicação deve ser responsiva (mobile, tablet, desktop)
- Dados sensíveis requerem autenticação e autorização robusta
- Histórico completo deve ser mantido (sem soft delete de versões)
- Notificações devem ser entregues em < 5 minutos
- Suporte a português brasileiro (i18n)

**Scale/Scope**: 
- ~14 moradores + síndico + conselho + administradora = ~20 stakeholders
- ~100-200 processos pré-cadastrados
- Múltiplas versões por processo (média estimada: 2-3 versões)
- Histórico completo de todas as ações

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Como não há constituição definida ainda para este projeto, assumimos princípios básicos:
- Test-First: TDD será aplicado para funcionalidades críticas (workflow de aprovação)
- Simplicidade: Começar com arquitetura simples, adicionar complexidade apenas quando necessário
- Segurança: Autenticação e autorização são obrigatórias desde o início
- Rastreabilidade: Histórico completo é não-negociável (requisito de negócio)

## Project Structure

### Documentation (this feature)

```text
specs/003-app-gestao-processos-aprovacao/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── openapi.yaml     # API specification
│   └── schemas/         # JSON schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── processes.py      # CRUD processos
│   │   │   │   │   ├── approvals.py      # Aprovações/rejeições
│   │   │   │   │   ├── stakeholders.py   # Gestão stakeholders
│   │   │   │   │   ├── notifications.py  # Notificações
│   │   │   │   │   ├── dashboard.py      # Dashboard/estatísticas
│   │   │   │   │   └── history.py        # Histórico
│   │   │   │   └── router.py
│   │   │   └── deps.py                   # Dependencies (auth, DB)
│   │   ├── core/
│   │   │   ├── config.py                 # Configurações
│   │   │   ├── security.py               # JWT, password hashing
│   │   │   └── database.py               # DB connection
│   │   ├── models/
│   │   │   ├── process.py                # Processo model
│   │   │   ├── version.py                # Versão model
│   │   │   ├── stakeholder.py            # Stakeholder model
│   │   │   ├── approval.py               # Aprovação model
│   │   │   ├── rejection.py              # Rejeição model
│   │   │   ├── notification.py           # Notificação model
│   │   │   └── history.py                # Histórico model
│   │   ├── schemas/
│   │   │   ├── process.py                # Pydantic schemas
│   │   │   ├── approval.py
│   │   │   ├── stakeholder.py
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── process_service.py        # Lógica de negócio processos
│   │   │   ├── approval_service.py       # Lógica workflow aprovação
│   │   │   ├── notification_service.py   # Envio notificações
│   │   │   ├── version_service.py        # Versionamento
│   │   │   └── seed_service.py           # Seed processos pré-cadastrados
│   │   └── main.py                       # FastAPI app
│   ├── alembic/
│   │   └── versions/                     # Migrations
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── requirements.txt
│   └── Dockerfile
│
frontend/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── processes/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx          # Detalhes processo
│   │   │   │   │   ├── edit/
│   │   │   │   │   └── refazer/
│   │   │   │   └── new/
│   │   │   ├── approvals/
│   │   │   └── history/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── processes/
│   │   │   ├── ProcessList.tsx
│   │   │   ├── ProcessCard.tsx
│   │   │   ├── ProcessDetail.tsx
│   │   │   ├── ProcessEditor.tsx
│   │   │   └── VersionComparison.tsx
│   │   ├── approvals/
│   │   │   ├── ApprovalActions.tsx
│   │   │   ├── RejectionForm.tsx
│   │   │   └── ApprovalStatus.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── PendingApprovals.tsx
│   │   │   └── RecentActivity.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Notifications.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                 # API client
│   │   │   ├── processes.ts
│   │   │   ├── approvals.ts
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useProcesses.ts
│   │   │   ├── useApprovals.ts
│   │   │   └── ...
│   │   └── utils/
│   ├── types/
│   │   └── index.ts                      # TypeScript types
│   └── styles/
│       └── globals.css
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── next.config.js
├── tailwind.config.js
└── Dockerfile
│
docker-compose.yml
README.md
.gitignore
```

**Structure Decision**: Estrutura web application (Option 2) escolhida porque:
- Separação clara entre frontend e backend permite desenvolvimento paralelo
- Backend API REST pode ser consumido por outros clientes no futuro
- Frontend Next.js oferece SSR/SSG para performance e SEO
- Estrutura modular facilita testes e manutenção

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nenhuma violação identificada. Arquitetura segue princípios de simplicidade e separação de responsabilidades.
